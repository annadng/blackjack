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
            alert("You must select a bet amount before placing a bet.");
            return false;
        }
        return true;
    };

    return {bet, addBet, resetBet, validateBet};
}