import { NextResponse } from "next/server";
import { dynamo } from "@/lib/dynamoClient";
import { PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

interface Card {
    value: number;
    name: string;
}

// Helper to draw a random card
function drawCard(): Card {
    const names = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
    const name = names[Math.floor(Math.random() * names.length)];
    let value: number;

    if (["J","Q","K"].includes(name)) value = 10;
    else if (name === "A") value = 11; // Handle Ace as 11 initially
    else value = parseInt(name);

    return { value, name };
}

// Calculate total with Ace adjustment
function calculateTotal(cards: Card[]): number {
    let total = cards.reduce((sum, c) => sum + c.value, 0);
    let aces = cards.filter(c => c.name === "A").length;

    while (total > 21 && aces > 0) {
        total -= 10; // count Ace as 1 instead of 11
        aces--;
    }

    return total;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, action, gameId, bet, currentPlayerCards, currentDealerCards } = body;

        if (!username) {
            return NextResponse.json({ error: "Missing username" }, { status: 400 });
        }

        if (action === "Place bet") {
            if (!bet || bet <= 0) {
                return NextResponse.json({ error: "Bet must be greater than 0" }, { status: 400 });
            }

            // Decrease chips
            const userUpdate = new UpdateCommand({
                TableName: process.env.DYNAMO_USERS_TABLE!,
                Key: { username },
                UpdateExpression: "SET chips = if_not_exists(chips, :zero) - :bet",
                ConditionExpression: "chips >= :bet",
                ExpressionAttributeValues: {
                    ":bet": bet,
                    ":zero": 0,
                },
                ReturnValues: "UPDATED_NEW",
            });
            
            try {
                await dynamo.send(userUpdate);
            } catch (err) {
                return NextResponse.json({ error: "Not enough chips" }, { status: 400 });
            }

            // Deal initial cards
            const playerCards = [drawCard(), drawCard()];
            const dealerCards = [drawCard()];

            const gameIdNew = Date.now().toString();

            return NextResponse.json({
                gameId: gameIdNew,
                playerCards,
                dealerCards,
                playerTotal: calculateTotal(playerCards),
                dealerTotal: calculateTotal(dealerCards),
            });
        }

        if (!gameId || !currentPlayerCards || !currentDealerCards) {
            return NextResponse.json({ error: "Missing game state for action" }, { status: 400 });
        }

        let playerCards: Card[] = currentPlayerCards;
        let dealerCards: Card[] = currentDealerCards;

        if (action === "hit") {
            const card = drawCard();
            playerCards.push(card);
            const playerTotal = calculateTotal(playerCards);

            let result = "ongoing";

            if (playerTotal > 21) {
                result = "lose";

                // Save history
                await dynamo.send(new PutCommand({
                    TableName: process.env.DYNAMO_HISTORY_TABLE!,
                    Item: {
                        username,
                        gameId,
                        playerTotal,
                        dealerTotal: calculateTotal(dealerCards),
                        result,
                        bet,
                        playedAt: new Date().toISOString(),
                    }
                }));
            }

            return NextResponse.json({ playerCards, dealerCards, playerTotal, dealerTotal: calculateTotal(dealerCards), result });
        }

        if (action === "stand") {
            // Dealer draws until total >= 17
            while (calculateTotal(dealerCards) < 17) {
                dealerCards.push(drawCard());
            }

            const playerTotal = calculateTotal(playerCards);
            const dealerTotal = calculateTotal(dealerCards);
            let result: "win" | "lose" | "push";

            if (dealerTotal > 21 || playerTotal > dealerTotal) result = "win";
            else if (dealerTotal > playerTotal) result = "lose";
            else result = "push";

            // Update chips if player won
            if (result === "win") {
                await dynamo.send(new UpdateCommand({
                    TableName: process.env.DYNAMO_USERS_TABLE!,
                    Key: { username },
                    UpdateExpression: "SET chips = if_not_exists(chips, :zero) + :bet",
                    ExpressionAttributeValues: { ":bet": bet! * 2, ":zero": 0 },
                }));
            } else if (result === "push") {
                await dynamo.send(new UpdateCommand({
                    TableName: process.env.DYNAMO_USERS_TABLE!,
                    Key: { username },
                    UpdateExpression: "SET chips = if_not_exists(chips, :zero) + :bet",
                    ExpressionAttributeValues: { ":bet": bet!, ":zero": 0 },
                }));
            }

            // Save history
            await dynamo.send(new PutCommand({
                TableName: process.env.DYNAMO_HISTORY_TABLE!,
                Item: {
                    username,
                    gameId,
                    playerTotal,
                    dealerTotal,
                    result,
                    bet,
                    playedAt: new Date().toISOString(),
                }
            }));

            return NextResponse.json({ playerCards, dealerCards, playerTotal, dealerTotal, result });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
