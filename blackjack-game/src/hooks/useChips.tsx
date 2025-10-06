import { useEffect, useState, useCallback } from "react";

export function useChips(username: string | null | undefined, guestChips: number = 0) {
    const [currentChips, setCurrentChips] = useState<number>(0);
    const isGuest = !username;

    const fetchChips = useCallback(async () => {
        if (isGuest) {
            // Use guest chips from localStorage
            setCurrentChips(guestChips);
            return;
        }

        // Fetch from server for logged-in users
        try {
            const res = await fetch(`/api/chips/balance?username=${username}`);
            const data = await res.json();
            setCurrentChips(data.chips);
        } catch (err) {
            console.error("Failed to fetch chips:", err);
        }
    }, [username, guestChips, isGuest]);

    useEffect(() => {
        fetchChips();
    }, [fetchChips]);

    return { currentChips, refetchChips: fetchChips };
}