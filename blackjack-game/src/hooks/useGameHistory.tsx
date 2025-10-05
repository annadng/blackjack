import { useState, useEffect } from "react";
import type {GameHistory, Card} from "@/types";

export function useGameHistory(username: string | null | undefined) {
    const [history, setHistory] = useState<GameHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchHistory() {
            if (!username) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`/api/game/history?username=${username}`);
                const data = await res.json();

                if (res.ok) {
                    setHistory(data.games);
                } else {
                    setError(data.error || "Failed to load history");
                }
            } catch (err) {
                console.error("Failed to fetch game history:", err);
                setError("Failed to load history");
            } finally {
                setLoading(false);
            }
        }

        fetchHistory();
    }, [username]);

    const saveGame = async (gameData: {
        username: string;
        bet: number;
        result: "win" | "lose" | "push";
        playerTotal: number;
        dealerTotal: number;
        playerCards: Card[];
        dealerCards: Card[];
        winnings: number;
    }) => {
        try {
            const res = await fetch("/api/game/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(gameData)
            });

            if (res.ok) {
                // Refresh history after saving
                const historyRes = await fetch(`/api/game/history?username=${gameData.username}`);
                const historyData = await historyRes.json();
                if (historyRes.ok) {
                    setHistory(historyData.games);
                }
            }
        } catch (err) {
            console.error("Failed to save game:", err);
        }
    };

    return {history, loading, error, saveGame};
}