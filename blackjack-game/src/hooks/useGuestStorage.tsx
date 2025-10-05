import { useState, useEffect } from "react";

const GUEST_CHIPS_KEY = "blackjack_guest_chips";
const GUEST_HISTORY_KEY = "blackjack_guest_history";
const DEFAULT_CHIPS = 100;

export function useGuestStorage() {
    const [guestChips, setGuestChips] = useState<number>(DEFAULT_CHIPS);
    const [guestHistory, setGuestHistory] = useState<any[]>([]);

    useEffect(() => {
        // Load from localStorage on mount
        const storedChips = localStorage.getItem(GUEST_CHIPS_KEY);
        const storedHistory = localStorage.getItem(GUEST_HISTORY_KEY);

        if (storedChips) {
            setGuestChips(parseInt(storedChips));
        } else {
            localStorage.setItem(GUEST_CHIPS_KEY, DEFAULT_CHIPS.toString());
        }

        if (storedHistory) {
            setGuestHistory(JSON.parse(storedHistory));
        }
    }, []);

    const updateGuestChips = (amount: number) => {
        setGuestChips(amount);
        localStorage.setItem(GUEST_CHIPS_KEY, amount.toString());
    };

    const addGuestChips = (amount: number) => {
        const newAmount = guestChips + amount;
        updateGuestChips(newAmount);
    };

    const deductGuestChips = (amount: number): boolean => {
        if (guestChips < amount) {
            return false;
        }
        updateGuestChips(guestChips - amount);
        return true;
    };

    const addGuestHistory = (game: any) => {
        const newHistory = [game, ...guestHistory];
        setGuestHistory(newHistory);
        localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(newHistory));
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
        clearGuestData
    };
}