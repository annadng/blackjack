import { useEffect, useState } from "react";

export function useChips(username: string | null | undefined) {
    const [currentChips, setCurrentChips] = useState<number>(0);

    useEffect(() => {
        async function fetchChips() {
            if (!username) return;

            try {
                const res = await fetch(`/api/chips/balance?username=${username}`);
                const data = await res.json();
                setCurrentChips(data.chips);
            } catch (err) {
                console.error("Failed to fetch chips:", err);
            }
        }

        fetchChips();
    }, [username]);

    return { currentChips };
}