import { useState, useEffect } from "react";

const GUEST_CHIPS_KEY = "blackjack_guest_chips";
const GUEST_HISTORY_KEY = "blackjack_guest_history";
const DEFAULT_CHIPS = 0;

export function useGuestStorage() {
    const [guestChips, setGuestChips] = useState<number>(0);
    const [guestHistory, setGuestHistory] = useState<any[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Load from localStorage on mount
        const stored = localStorage.getItem(GUEST_CHIPS_KEY);
        const storedHistory = localStorage.getItem(GUEST_HISTORY_KEY);

        // If stored chips exist, use them; otherwise default to 0
        setGuestChips(stored ? parseInt(stored) : DEFAULT_CHIPS);
        setGuestHistory(storedHistory ? JSON.parse(storedHistory) : []);
        setIsLoaded(true);
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
        clearGuestData,
        isLoaded
    };
}