import { useState } from "react";

export const ALLOWED_BETS = [5, 25, 100];

export function useBetting() {
    const [bet, setBet] = useState(0);

    const addBet = (amount: number) => {
        setBet(prev => prev + amount);
    };

    const resetBet = () => {
        setBet(0);
    };

    const validateBet = () => {
        if (bet <= 0) {
            console.warn("No bet amount selected");
            return false;
        }
        return true;
    };

    return {bet, addBet, resetBet, validateBet};
}