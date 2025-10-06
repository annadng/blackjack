"use client";

import { useEffect, useState } from "react";

export function useChips(
    username: string | null | undefined,
    guestChips: number = 0,
    isLoaded: boolean = false
) {
    const [currentChips, setCurrentChips] = useState<number>(0);
    const isGuest = !username;

    useEffect(() => {
        console.log('useChips effect:', { isGuest, isLoaded, guestChips, username });

        if (isGuest && isLoaded) {
            // For guests, use the guestChips value
            console.log('Setting guest chips to:', guestChips);
            setCurrentChips(guestChips);
        } else if (username) {
            // For logged-in users, fetch from API
            console.log('Fetching chips for user:', username);
            fetch(`/api/chips/balance?username=${username}`)
                .then(res => res.json())
                .then(data => setCurrentChips(data.chips))
                .catch(err => console.error("Failed to fetch chips:", err));
        }
    }, [isGuest, username, guestChips, isLoaded]);

    const refetchChips = async () => {
        if (isGuest && isLoaded) {
            setCurrentChips(guestChips);
        } else if (username) {
            try {
                const res = await fetch(`/api/chips/balance?username=${username}`);
                const data = await res.json();
                setCurrentChips(data.chips);
            } catch (err) {
                console.error("Failed to fetch chips:", err);
            }
        }
    };

    return { currentChips, refetchChips };
}