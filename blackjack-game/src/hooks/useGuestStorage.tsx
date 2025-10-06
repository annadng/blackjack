import { useState, useEffect } from "react";
import type { Card } from "@/types";
import {getGuestId} from "@/utils/guest";

export function useGuestStorage() {
    const [guestChips, setGuestChips] = useState<number>(0);
    const [guestHistory, setGuestHistory] = useState<any[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const guestId = getGuestId();

    // Load guest data from DynamoDB on mount
    useEffect(() => {
        if (!guestId) return;

        const fetchGuestData = async () => {
            try {
                // Fetch chips
                const chipsRes = await fetch(`/api/chips/balance?username=${guestId}`);
                const chipsData = await chipsRes.json();
                setGuestChips(chipsData.chips || 0);

                // Fetch game history
                const historyRes = await fetch(`/api/history?username=${guestId}&limit=50`);
                const historyData = await historyRes.json();
                setGuestHistory(historyData.games || []);
            } catch (err) {
                console.error("Failed to load guest data:", err);
            } finally {
                setIsLoaded(true);
            }
        };

        fetchGuestData();
    }, [guestId]);

    const updateGuestChips = (amount: number) => {
        setGuestChips(amount);
    };

    const addGuestChips = async (amount: number) => {
        try {
            const res = await fetch("/api/chips/buy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: guestId,
                    amount
                })
            });
            const data = await res.json();
            setGuestChips(data.newBalance || guestChips + amount);
        } catch (err) {
            console.error("Failed to add chips:", err);
        }
    };

    const deductGuestChips = async (amount: number): Promise<boolean> => {
        if (guestChips < amount) return false;

        try {
            const res = await fetch("/api/chips/deduct", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: guestId,
                    amount
                })
            });

            if (!res.ok) return false;

            const data = await res.json();
            setGuestChips(data.newBalance || guestChips - amount);
            return true;
        } catch (err) {
            console.error("Failed to deduct chips:", err);
            return false;
        }
    };

    const addGuestHistory = async (game: {
        id: string;
        username: string;
        timestamp: number;
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
                body: JSON.stringify(game)
            });

            if (res.ok) {
                // Add to local state optimistically
                setGuestHistory((prev) => [game, ...prev].slice(0, 50));
            }
        } catch (err) {
            console.error("Failed to save guest game:", err);
        }
    };

    const clearGuestData = () => {
        sessionStorage.removeItem("guestId");
        setGuestChips(0);
        setGuestHistory([]);
    };

    return {
        guestId,
        guestChips,
        guestHistory,
        updateGuestChips,
        addGuestChips,
        deductGuestChips,
        addGuestHistory,
        clearGuestData,
        isLoaded,
    };
}