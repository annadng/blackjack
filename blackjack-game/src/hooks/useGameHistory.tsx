import { useState, useEffect, useCallback } from "react";
import type { Card } from "@/types";

const ITEMS_PER_PAGE = 10;

export function useGameHistory(username?: string | null) {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [lastKey, setLastKey] = useState<string | null>(null);

    const fetchHistory = useCallback(
        async (page: number = 1) => {
            if (!username) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const limit = ITEMS_PER_PAGE;
                const params = new URLSearchParams({
                    username,
                    limit: limit.toString()
                });

                if (lastKey) {
                    params.append('lastKey', lastKey);
                }

                const res = await fetch(`/api/history?${params}`);
                const data = await res.json();

                setHistory(data.games || []);
                setTotalPages(Math.ceil((data.count ?? 0) / ITEMS_PER_PAGE));
                setCurrentPage(page);
                setLastKey(data.lastKey || null);
            } catch (err: any) {
                console.error("Failed to fetch history:", err);
                setError("Failed to fetch game history");
            } finally {
                setLoading(false);
            }
        },
        [username, lastKey]
    );

    const goToPage = (page: number) => {
        fetchHistory(page);
    };

    const saveGame = async (gameData: {
        username: string;
        bet: number;
        result: "win" | "lose" | "push" | "blackjack";
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
                fetchHistory(1);
            }
        } catch (err) {
            console.error("Failed to save game:", err);
        }
    };

    useEffect(() => {
        fetchHistory(1);
    }, [username]); // Only depend on username, not fetchHistory to avoid loops

    const refetchHistory = () => {
        fetchHistory(currentPage);
    };

    return {
        history,
        loading,
        error,
        currentPage,
        totalPages,
        goToPage,
        saveGame,
        refetchHistory
    };
}