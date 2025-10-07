import { useState } from "react";
import type {Card} from "@/types";

export type GameResult = "win" | "lose" | "push" | "blackjack" | null;
export type ActionType = "hit" | "stand" | null;

export function useBlackjack() {
    const [dealerCards, setDealerCards] = useState<Card[]>([]);
    const [playerCards, setPlayerCards] = useState<Card[]>([]);
    const [dealerTotal, setDealerTotal] = useState(0);
    const [playerTotal, setPlayerTotal] = useState(0);
    const [gameActive, setGameActive] = useState(false);
    const [result, setResult] = useState<GameResult>(null);
    const [gameId, setGameId] = useState<string | null>(null);

    const dealInitialCards = async (username: string, bet: number) => {
        try {
            const response = await fetch("/api/game", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    action: "deal",
                    bet,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || "Failed to start game");
                return false;
            }

            setGameId(data.gameId);
            setPlayerCards(data.playerCards);
            setDealerCards(data.dealerCards);
            setPlayerTotal(data.playerTotal);
            setDealerTotal(data.dealerTotal);
            setGameActive(true);
            setResult(null);

            return true;
        } catch (error) {
            console.error("Failed to deal cards:", error);
            alert("Failed to start game");
            return false;
        }
    };

    const hit = async (username: string) => {
        if (!gameId) return;

        try {
            const response = await fetch("/api/game", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    action: "hit",
                    gameId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || "Failed to hit");
                return;
            }

            setPlayerCards(data.playerCards);
            setPlayerTotal(data.playerTotal);
            setDealerCards(data.dealerCards);
            setDealerTotal(data.dealerTotal);

            if (data.result) {
                setResult(data.result);
                setGameActive(false);
            }
        } catch (error) {
            console.error("Failed to hit:", error);
        }
    };

    const stand = async (username: string) => {
        if (!gameId) return;

        try {
            const response = await fetch("/api/game", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    action: "stand",
                    gameId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || "Failed to stand");
                return;
            }

            setPlayerCards(data.playerCards);
            setDealerCards(data.dealerCards);
            setPlayerTotal(data.playerTotal);
            setDealerTotal(data.dealerTotal);
            setResult(data.result);
            setGameActive(false);
        } catch (error) {
            console.error("Failed to stand:", error);
        }
    };

    const resetGame = () => {
        setPlayerCards([]);
        setDealerCards([]);
        setPlayerTotal(0);
        setDealerTotal(0);
        setResult(null);
        setGameActive(false);
        setGameId(null);
    };

    return {
        dealerCards,
        playerCards,
        dealerTotal,
        playerTotal,
        gameActive,
        result,
        gameId,
        dealInitialCards,
        hit,
        stand,
        resetGame,
    };
}