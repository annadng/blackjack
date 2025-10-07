import { useState } from "react";
import type {Card} from "@/types";

export type GameResult = "win" | "lose" | "push" | "blackjack" | null;

function drawCard(): Card {
    const names = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    const name = names[Math.floor(Math.random() * names.length)];
    let value: number;
    if (["J", "Q", "K"].includes(name)) value = 10;
    else if (name === "A") value = 11;
    else value = parseInt(name);
    return { name, value };
}

function calculateTotal(cards: Card[]): number {
    let total = cards.reduce((sum, c) => sum + c.value, 0);
    let aces = cards.filter((c) => c.name === "A").length;
    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }
    return total;
}

export function useGuestGame() {
    const [dealerCards, setDealerCards] = useState<Card[]>([]);
    const [playerCards, setPlayerCards] = useState<Card[]>([]);
    const [dealerTotal, setDealerTotal] = useState(0);
    const [playerTotal, setPlayerTotal] = useState(0);
    const [gameActive, setGameActive] = useState(false);
    const [result, setResult] = useState<GameResult>(null);

    const dealInitialCards = () => {
        const pCards = [drawCard(), drawCard()];
        const dCards = [drawCard()];
        const pTotal = calculateTotal(pCards);

        setPlayerCards(pCards);
        setDealerCards(dCards);
        setPlayerTotal(pTotal);
        setDealerTotal(calculateTotal(dCards));

        // Check for blackjack
        if (pTotal === 21 && pCards.length === 2) {
            setResult("blackjack");
            setGameActive(false);
        } else {
            setGameActive(true);
            setResult(null);
        }
    };

    const hit = () => {
        const card = drawCard();
        const newPlayerCards = [...playerCards, card];
        const newTotal = calculateTotal(newPlayerCards);

        setPlayerCards(newPlayerCards);
        setPlayerTotal(newTotal);

        if (newTotal > 21) {
            setResult("lose");
            setGameActive(false);
        }
    };

    const stand = () => {
        let newDealerCards = [...dealerCards];

        while (calculateTotal(newDealerCards) < 17) {
            newDealerCards.push(drawCard());
        }

        const dealerScore = calculateTotal(newDealerCards);
        const playerScore = calculateTotal(playerCards);

        setDealerCards(newDealerCards);
        setDealerTotal(dealerScore);
        setPlayerTotal(playerScore);

        let gameResult: GameResult;

        // Check for blackjack
        if (playerScore === 21 && playerCards.length === 2) {
            gameResult = "blackjack";
        } else if (dealerScore > 21 || playerScore > dealerScore) {
            gameResult = "win";
        } else if (dealerScore > playerScore) {
            gameResult = "lose";
        } else {
            gameResult = "push";
        }

        setResult(gameResult);
        setGameActive(false);
    };

    const resetGame = () => {
        setPlayerCards([]);
        setDealerCards([]);
        setPlayerTotal(0);
        setDealerTotal(0);
        setResult(null);
        setGameActive(false);
    };

    return {
        dealerCards,
        playerCards,
        dealerTotal,
        playerTotal,
        gameActive,
        result,
        dealInitialCards,
        hit,
        stand,
        resetGame,
    };
}