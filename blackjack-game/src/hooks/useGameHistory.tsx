import { useState, useEffect, useCallback } from "react";
import type {GameHistory, Card} from "@/types";

const ITEMS_PER_PAGE = 10;

export function useGameHistory(username: string | null | undefined) {
    const [allHistory, setAllHistory] = useState<GameHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchAllHistory = useCallback(async () => {
        if (!username) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            let allGames: GameHistory[] = [];
            let lastKey: string | null = null;
            let hasMore = true;

            // Fetch all pages
            while (hasMore) {
                const url = new URL("/api/game/history", window.location.origin);
                url.searchParams.set("username", username);
                url.searchParams.set("limit", "100"); // Fetch larger chunks

                if (lastKey) {
                    url.searchParams.set("lastKey", lastKey);
                }

                const res = await fetch(url.toString());
                const data = await res.json();

                if (res.ok) {
                    allGames = [...allGames, ...data.games];
                    hasMore = data.hasMore;
                    lastKey = data.lastKey;
                } else {
                    setError(data.error || "Failed to load history");
                    hasMore = false;
                }
            }

            setAllHistory(allGames);
        } catch (err) {
            console.error("Failed to fetch game history:", err);
            setError("Failed to load history");
        } finally {
            setLoading(false);
        }
    }, [username]);

    useEffect(() => {
        fetchAllHistory();
    }, [fetchAllHistory]);

    const totalPages = Math.ceil(allHistory.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedHistory = allHistory.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
                fetchAllHistory();
                setCurrentPage(1); // Go to first page to see new game
            }
        } catch (err) {
            console.error("Failed to save game:", err);
        }
    };

    return {
        history: paginatedHistory,
        allHistory,
        loading,
        error,
        saveGame,
        currentPage,
        totalPages,
        goToPage
    };
}