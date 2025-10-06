import { useState, useEffect } from "react";
import type { Card } from "@/types";

const GUEST_CHIPS_KEY = "blackjack_guest_chips";
const GUEST_HISTORY_KEY = "blackjack_guest_history";
const DEFAULT_CHIPS = 0;
const MAX_HISTORY = 50; // Keep only the last 50 games

export function useGuestStorage() {
    const [guestChips, setGuestChips] = useState<number>(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem(GUEST_CHIPS_KEY);
            if (stored) return parseInt(stored, 10);
            localStorage.setItem(GUEST_CHIPS_KEY, DEFAULT_CHIPS.toString());
        }
        return DEFAULT_CHIPS;
    });

    const [guestHistory, setGuestHistory] = useState<any[]>(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem(GUEST_HISTORY_KEY);
            return stored ? JSON.parse(stored) : [];
        }
        return [];
    });

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const updateGuestChips = (amount: number) => {
        setGuestChips(amount);
        localStorage.setItem(GUEST_CHIPS_KEY, amount.toString());
    };

    const addGuestChips = (amount: number) => {
        updateGuestChips(guestChips + amount);
    };

    const deductGuestChips = (amount: number): boolean => {
        if (guestChips < amount) return false;
        updateGuestChips(guestChips - amount);
        return true;
    };

    const addGuestHistory = (game: {
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
        // Keep the raw data structure that matches what HistoryPage expects
        const newEntry = {
            id: game.id,
            username: game.username,
            timestamp: game.timestamp,
            bet: game.bet,  // Keep as number
            result: game.result,  // Keep as string enum
            playerTotal: game.playerTotal,  // Keep as number
            dealerTotal: game.dealerTotal,  // Keep as number
            playerCards: game.playerCards,
            dealerCards: game.dealerCards,
            winnings: game.winnings  // Keep as number
        };

        const newHistory = [newEntry, ...guestHistory].slice(0, MAX_HISTORY);

        setGuestHistory(newHistory);

        try {
            localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(newHistory));
            console.log('[useGuestStorage] Saved to localStorage:', newEntry);
        } catch (err) {
            console.warn("localStorage quota exceeded, cannot save guest history", err);
        }
    };

    const clearGuestData = () => {
        localStorage.removeItem(GUEST_CHIPS_KEY);
        localStorage.removeItem(GUEST_HISTORY_KEY);
        setGuestChips(DEFAULT_CHIPS);
        setGuestHistory([]);
    };

    return {
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