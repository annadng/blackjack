import { useState, useEffect, useCallback } from "react";

export function useChips(username: string | null | undefined, guestChips?: number, isGuestLoaded?: boolean) {
    const [currentChips, setCurrentChips] = useState(0);
    const [loading, setLoading] = useState(false);
    const isGuest = !username || username.startsWith("guest-");

    useEffect(() => {
        if (isGuest && isGuestLoaded) {
            setCurrentChips(guestChips ?? 0);
        }
    }, [guestChips, isGuestLoaded, isGuest]);


    const fetchChips = useCallback(async () => {
        if (isGuest && isGuestLoaded) {
            setCurrentChips(guestChips ?? 0);
            return;
        }

        if (!username) {
            setCurrentChips(0);
            return;
        }

        // Otherwise fetch from API
        setLoading(true);
        try {
            const res = await fetch(`/api/chips/balance?username=${username}`);
            const data = await res.json();
            setCurrentChips(data.chips ?? 0);
        } catch (err) {
            console.error("Failed to fetch chips:", err);
            setCurrentChips(0);
        } finally {
            setLoading(false);
        }
    }, [username, guestChips, isGuestLoaded, isGuest]);

    useEffect(() => {
        fetchChips();
    }, [fetchChips, guestChips]);

    const refetchChips = () => {
        fetchChips();
    };

    return { currentChips, loading, refetchChips };
}