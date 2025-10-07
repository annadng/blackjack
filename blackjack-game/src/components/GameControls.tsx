"use client";

import type { ActionType } from "@/hooks/useBlackjack";

interface GameControlsProps {
    onHit: () => void;
    onStand: () => void;
    onAskAI: () => void;
    highlightAction: ActionType;
    aiLoading?: boolean;
}

export default function GameControls({onHit, onStand, onAskAI, highlightAction, aiLoading}: GameControlsProps) {
    return (
        <div className="flex items-center space-x-4 mt-4">
            <button
                onClick={onHit}
                className={`px-6 py-2 rounded shadow font-bold ${
                    highlightAction === "hit"
                        ? "bg-pink-600 text-white"
                        : "bg-pink-400 text-white hover:bg-pink-500"
                }`}
            >
                Hit
            </button>

            <div className="relative group">
                <button
                    onClick={onAskAI}
                    disabled={aiLoading}
                    className="px-6 py-2 font-bold bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {aiLoading ? (
                        <svg className="animate-spin h-5 w-5 text-pink-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        "?"
                    )}
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Ask AI for advice
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-800"></div>
                </div>
            </div>

            <button
                onClick={onStand}
                className={`px-6 py-2 rounded shadow font-bold ${
                    highlightAction === "stand"
                        ? "bg-pink-600 text-white"
                        : "bg-pink-400 text-white hover:bg-pink-500"
                }`}
            >
                Stand
            </button>
        </div>
    );
}