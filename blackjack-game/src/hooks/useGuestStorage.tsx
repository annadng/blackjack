import { useEffect, useState } from "react";

export function useGuestStorage() {
    const [guestChips, setGuestChips] = useState(0);
    const [guestHistory, setGuestHistory] = useState<any[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load guest data from sessionStorage 
    useEffect(() => {
        const storedChips = sessionStorage.getItem("blackjack_guest_chips");
        const storedHistory = sessionStorage.getItem("blackjack_guest_history");

        if (storedChips) {
            setGuestChips(parseInt(storedChips, 10));
        } else {
            setGuestChips(0); // starting amount
        }

        if (storedHistory) {
            setGuestHistory(JSON.parse(storedHistory));
        }

        setIsLoaded(true);
    }, []);

    // Save to sessionStorage when chips change
    useEffect(() => {
        if (isLoaded) {
            sessionStorage.setItem("blackjack_guest_chips", guestChips.toString());
        }
    }, [guestChips, isLoaded]);

    // Save to sessionStorage when history changes
    useEffect(() => {
        if (isLoaded) {
            sessionStorage.setItem("blackjack_guest_history", JSON.stringify(guestHistory));
        }
    }, [guestHistory, isLoaded]);

    // Functions to modify guest data
    const addGuestChips = async (amount: number) => {
        setGuestChips(prev => prev + amount);
    };

    const deductGuestChips = async (amount: number) => {
        if (guestChips < amount) return false;
        setGuestChips(prev => prev - amount);
        return true;
    };

    const addGuestHistory = (entry: any) => {
        setGuestHistory(prev => [...prev, entry]);
    };

    const resetGuestData = () => {
        sessionStorage.removeItem("blackjack_guest_history");
        sessionStorage.removeItem("blackjack_guest_chips");
        setGuestChips(0);
        setGuestHistory([]);
    };

    return {
        guestChips,
        isLoaded,
        deductGuestChips,
        addGuestChips,
        addGuestHistory,
        resetGuestData
    };
}
