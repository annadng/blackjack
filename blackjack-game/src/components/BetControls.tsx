"use client";

import { ALLOWED_BETS } from "@/hooks/useBetting";

interface BetControlsProps {
    bet: number;
    onSelectBet: (amount: number) => void;
    onPlaceBet: () => void;
}

export default function BetControls({ bet, onSelectBet, onPlaceBet }: BetControlsProps) {
    return (
        <>
            <div className="flex space-x-4">
                {ALLOWED_BETS.map((b) => (
                    <button
                        key={b}
                        className={`px-4 py-2 rounded shadow font-bold bg-pink-400 text-white hover:bg-pink-500 ${
                            bet === b ? "ring-2 ring-pink-600" : ""
                        }`}
                        onClick={() => onSelectBet(b)}
                    >
                        +{b}
                    </button>
                ))}
            </div>

            <button
                onClick={onPlaceBet}
                className="px-8 py-2 bg-pink-600 text-white font-bold rounded shadow hover:bg-pink-700"
            >
                Place Bet
            </button>
        </>
    );
}