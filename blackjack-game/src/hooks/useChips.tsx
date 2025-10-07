import { useState, useEffect, useRef } from "react";

export function useChips(username: string | null | undefined, guestChips?: number, isGuestLoaded?: boolean) {
    const [currentChips, setCurrentChips] = useState(0);
    const [loading, setLoading] = useState(true);
    const isGuest = !username || username.startsWith("guest-");

    // For guests, update chips from prop
    useEffect(() => {
        if (isGuest && isGuestLoaded) {
            setCurrentChips(guestChips ?? 0);
            setLoading(false);
        }
    }, [guestChips, isGuestLoaded, isGuest]);

    // For logged-in users, fetch from API on mount
    useEffect(() => {
        if (!isGuest && username) {
            setLoading(true);
            fetch(`/api/chips/balance?username=${username}`)
                .then(res => res.json())
                .then(data => {
                    console.log("Fetched chips for", username, ":", data.chips);
                    setCurrentChips(data.chips ?? 0);
                })
                .catch(err => {
                    console.error("Failed to fetch chips:", err);
                    setCurrentChips(0);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [username, isGuest]);

    const refetchChips = () => {
        if (isGuest && isGuestLoaded) {
            setCurrentChips(guestChips ?? 0);
            setLoading(false);
            return;
        }

        if (!username) {
            setCurrentChips(0);
            setLoading(false);
            return;
        }

        setLoading(true);
        fetch(`/api/chips/balance?username=${username}`)
            .then(res => res.json())
            .then(data => {
                console.log("Fetched chips for", username, ":", data.chips);
                setCurrentChips(data.chips ?? 0);
            })
            .catch(err => {
                console.error("Failed to fetch chips:", err);
                setCurrentChips(0);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return { currentChips, loading, refetchChips };
}