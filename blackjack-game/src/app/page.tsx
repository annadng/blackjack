"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import CardRow from "@/components/CardPlaceholders";

interface Card {
    name: string;
    value: number;
}

export default function GamePage() {
    const [dealerCards, setDealerCards] = useState<Card[]>([]);
    const [playerCards, setPlayerCards] = useState<Card[]>([]);
    const [dealerTotal, setDealerTotal] = useState(0);
    const [playerTotal, setPlayerTotal] = useState(0);
    const [bet, setBet] = useState(0);
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const [highlightAction, setHighlightAction] = useState<"hit" | "stand" | null>(null);
    const [result, setResult] = useState<"win" | "lose" | "push" | null>(null);
    const allowedBets = [5, 25, 100];
    const [gameActive, setGameActive] = useState(false);

    const drawCard = (): Card => {
        const names = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
        const name = names[Math.floor(Math.random() * names.length)];
        let value: number;
        if (["J","Q","K"].includes(name)) value = 10;
        else if (name === "A") value = 11;
        else value = parseInt(name);
        return { name, value };
    };

    const calculateTotal = (cards: Card[]) => {
        let total = cards.reduce((sum, c) => sum + c.value, 0);
        let aces = cards.filter(c => c.name === "A").length;
        while (total > 21 && aces > 0) {
            total -= 10;
            aces--;
        }
        return total;
    };

    const placeBet = () => {
        if (bet <= 0) {
            alert("You must select a bet amount before placing a bet.");
            return;
        }

        // Deal initial cards
        const pCards = [drawCard(), drawCard()];
        const dCards = [drawCard()];

        // Update state
        setPlayerCards(pCards);
        setDealerCards(dCards);
        setPlayerTotal(calculateTotal(pCards));
        setDealerTotal(calculateTotal(dCards));

        // Reset AI suggestion and highlight
        setAiSuggestion(null);
        setHighlightAction(null);
    };

    const hit = () => {
        const card = drawCard();
        const newPlayerCards = [...playerCards, card];
        setPlayerCards(newPlayerCards);
        setPlayerTotal(calculateTotal(newPlayerCards));

        // Reset AI suggestion/highlight
        setAiSuggestion(null);
        setHighlightAction(null);

        // Check if player busted
        if (calculateTotal(newPlayerCards) > 21) {
            endGame("lose");
        }
    };

    const stand = () => {
        let newDealerCards = [...dealerCards];

        // Dealer draws until total >= 17
        while (calculateTotal(newDealerCards) < 17) {
            newDealerCards.push(drawCard());
        }
        setDealerCards(newDealerCards);
        setDealerTotal(calculateTotal(newDealerCards));

        // Determine result
        const playerScore = playerTotal;
        const dealerScore = calculateTotal(newDealerCards);
        let result: "win" | "lose" | "push";
        if (dealerScore > 21 || playerScore > dealerScore) result = "win";
        else if (dealerScore > playerScore) result = "lose";
        else result = "push";

        endGame(result);

        // Reset AI suggestion/highlight
        setAiSuggestion(null);
        setHighlightAction(null);
    };

    const askAI = async () => {
        try {
            // Send current game state to AI assistant
            const response = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    playerCards,
                    dealerCards
                }),
            });

            const data = await response.json();
            
            const suggestion = data.recommendation;
            setAiSuggestion(suggestion);
            setHighlightAction(suggestion);

        } catch (err) {
            console.error("AI request failed:", err);
            setAiSuggestion("Unknown");
            setHighlightAction(null);
        }
    };

    const endGame = (outcome: "win" | "lose" | "push") => {
        setResult(outcome);
        setGameActive(false);
    };