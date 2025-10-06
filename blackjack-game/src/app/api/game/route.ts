import { NextRequest, NextResponse } from "next/server";
import { dynamo } from "@/lib/dynamoClient";
import { PutCommand, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import type {Card} from "@/types";

// Helper to draw a random card
function drawCard(): Card {
    const names = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    const name = names[Math.floor(Math.random() * names.length)];
    let value: number;

    if (["J", "Q", "K"].includes(name)) value = 10;
    else if (name === "A") value = 11;
    else value = parseInt(name);

    return { name, value };
}

// Calculate total with Ace adjustment
function calculateTotal(cards: Card[]): number {
    let total = cards.reduce((sum, c) => sum + c.value, 0);
    let aces = cards.filter((c) => c.name === "A").length;

    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }

    return total;
}

export async function POST(request: NextRequest) {
    try {
        const { username, action, gameId, bet } = await request.json();

        if (!username) {
            return NextResponse.json({ error: "Missing username" }, { status: 400 });
        }

        // Start new game
        if (action === "deal") {
            if (!bet || bet <= 0) {
                return NextResponse.json({ error: "Invalid bet amount" }, { status: 400 });
            }

            // Deduct chips
            try {
                await dynamo.send(
                    new UpdateCommand({
                        TableName: process.env.DYNAMO_USERS_TABLE || "blackjack-users",
                        Key: { username },
                        UpdateExpression: "SET chips = chips - :bet",
                        ConditionExpression: "chips >= :bet",
                        ExpressionAttributeValues: { ":bet": bet },
                        ReturnValues: "ALL_NEW",
                    })
                );
            } catch (err) {
                return NextResponse.json({ error: "Insufficient chips" }, { status: 400 });
            }

            // Deal initial cards
            const playerCards = [drawCard(), drawCard()];
            const dealerCards = [drawCard()];
            const newGameId = `${username}-${Date.now()}`;

            const playerTotal = calculateTotal(playerCards);
            const dealerTotal = calculateTotal(dealerCards);

            // Store game state in DynamoDB
            await dynamo.send(
                new PutCommand({
                    TableName: process.env.GAME_STATE_TABLE || "blackjack-game-state",
                    Item: {
                        gameId: newGameId,
                        username,
                        playerCards,
                        dealerCards,
                        bet,
                        playerTotal,
                        dealerTotal,
                        status: "active",
                        createdAt: Date.now(),
                    },
                })
            );

            return NextResponse.json({
                gameId: newGameId,
                playerCards,
                dealerCards,
                playerTotal,
                dealerTotal,
            });
        }

        // For hit/stand actions, validate gameId
        if (!gameId) {
            return NextResponse.json({ error: "Missing gameId" }, { status: 400 });
        }

        // Get current game state
        const gameState = await dynamo.send(
            new GetCommand({
                TableName: process.env.GAME_STATE_TABLE || "blackjack-game-state",
                Key: { gameId },
            })
        );

        if (!gameState.Item || gameState.Item.status !== "active") {
            return NextResponse.json({ error: "Invalid game state" }, { status: 400 });
        }

        let { playerCards, dealerCards, bet: gameBet } = gameState.Item;

        // Hit action
        if (action === "hit") {
            const card = drawCard();
            playerCards = [...playerCards, card];
            const playerTotal = calculateTotal(playerCards);
            const dealerTotal = calculateTotal(dealerCards);

            if (playerTotal > 21) {
                // Player busts
                await dynamo.send(
                    new UpdateCommand({
                        TableName: process.env.GAME_STATE_TABLE || "blackjack-game-state",
                        Key: { gameId },
                        UpdateExpression: "SET #status = :status, playerCards = :cards, playerTotal = :total",
                        ExpressionAttributeNames: { "#status": "status" },
                        ExpressionAttributeValues: {
                            ":status": "finished",
                            ":cards": playerCards,
                            ":total": playerTotal,
                        },
                    })
                );

                return NextResponse.json({
                    playerCards,
                    dealerCards,
                    playerTotal,
                    dealerTotal,
                    result: "lose",
                    gameActive: false,
                });
            }

            // Update game state
            await dynamo.send(
                new UpdateCommand({
                    TableName: process.env.GAME_STATE_TABLE || "blackjack-game-state",
                    Key: { gameId },
                    UpdateExpression: "SET playerCards = :cards, playerTotal = :total",
                    ExpressionAttributeValues: {
                        ":cards": playerCards,
                        ":total": playerTotal,
                    },
                })
            );

            return NextResponse.json({
                playerCards,
                dealerCards,
                playerTotal,
                dealerTotal,
                result: null,
                gameActive: true,
            });
        }

        // Stand action
        if (action === "stand") {
            // Dealer draws until >= 17
            while (calculateTotal(dealerCards) < 17) {
                dealerCards = [...dealerCards, drawCard()];
            }

            const playerTotal = calculateTotal(playerCards);
            const dealerTotal = calculateTotal(dealerCards);
            let result: "win" | "lose" | "push";

            if (dealerTotal > 21 || playerTotal > dealerTotal) {
                result = "win";
            } else if (dealerTotal > playerTotal) {
                result = "lose";
            } else {
                result = "push";
            }

            // Calculate payout
            let payout = 0;
            if (result === "win") {
                payout = gameBet * 2;
            } else if (result === "push") {
                payout = gameBet;
            }

            // Update chips if there's a payout
            if (payout > 0) {
                await dynamo.send(
                    new UpdateCommand({
                        TableName: process.env.DYNAMO_USERS_TABLE || "blackjack-users",
                        Key: { username },
                        UpdateExpression: "SET chips = chips + :payout",
                        ExpressionAttributeValues: { ":payout": payout },
                    })
                );
            }

            // Mark game as finished
            await dynamo.send(
                new UpdateCommand({
                    TableName: process.env.GAME_STATE_TABLE,
                    Key: { gameId },
                    UpdateExpression:
                        "SET #status = :status, dealerCards = :dcards, playerTotal = :ptotal, dealerTotal = :dtotal, result = :result",
                    ExpressionAttributeNames: { "#status": "status" },
                    ExpressionAttributeValues: {
                        ":status": "finished",
                        ":dcards": dealerCards,
                        ":ptotal": playerTotal,
                        ":dtotal": dealerTotal,
                        ":result": result,
                    },
                })
            );

            return NextResponse.json({
                playerCards,
                dealerCards,
                playerTotal,
                dealerTotal,
                result,
                gameActive: false,
            });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Game error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}