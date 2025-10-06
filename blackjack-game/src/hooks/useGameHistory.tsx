import { useState, useEffect, useCallback } from "react";
import type {GameHistory, Card} from "@/types";

export function useGameHistory(username: string | null | undefined) {
    const [history, setHistory] = useState<GameHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [lastKey, setLastKey] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchHistory = useCallback(async (reset: boolean = false) => {
        if (!username) {
            setLoading(false);
            return;
        }

        try {
            if (reset) {
                setLoading(true);
                setLastKey(null);
            } else {
                setLoadingMore(true);
            }

            const url = new URL("/api/game/history", window.location.origin);
            url.searchParams.set("username", username);
            url.searchParams.set("limit", "10");

            if (!reset && lastKey) {
                url.searchParams.set("lastKey", lastKey);
            }

            const res = await fetch(url.toString());
            const data = await res.json();

            if (res.ok) {
                if (reset) {
                    setHistory(data.games);
                } else {
                    setHistory(prev => [...prev, ...data.games]);
                }
                setHasMore(data.hasMore);
                setLastKey(data.lastKey);
            } else {
                setError(data.error || "Failed to load history");
            }
        } catch (err) {
            console.error("Failed to fetch game history:", err);
            setError("Failed to load history");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [username, lastKey]);

    useEffect(() => {
        fetchHistory(true);
    }, [username]);

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            fetchHistory(false);
        }
    };

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
                fetchHistory(true);
            }
        } catch (err) {
            console.error("Failed to save game:", err);
        }
    };

    return {
        history,
        loading,
        error,
        saveGame,
        hasMore,
        loadMore,
        loadingMore
    };
}