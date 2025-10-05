import type { ActionType } from "@/hooks/useBlackjack";

interface GameControlsProps {
    onHit: () => void;
    onStand: () => void;
    onAskAI: () => void;
    highlightAction: ActionType;
}

export default function GameControls({onHit, onStand, onAskAI, highlightAction}: GameControlsProps) {
    return (
        <div className="flex items-center space-x-4 mt-4">
            <button
                onClick={onHit}
                className={`px-6 py-2 rounded shadow font-bold ${
                    highlightAction === "hit"
                        ? "bg-pink-700 text-white"
                        : "bg-pink-400 text-white hover:bg-pink-500"
                }`}
            >
                Hit
            </button>

            <button
                onClick={onAskAI}
                className="px-6 py-2 rounded shadow font-bold bg-white text-pink-700 border border-pink-400 hover:bg-pink-100"
            >
                ?
            </button>

            <button
                onClick={onStand}
                className={`px-6 py-2 rounded shadow font-bold ${
                    highlightAction === "stand"
                        ? "bg-pink-700 text-white"
                        : "bg-pink-400 text-white hover:bg-pink-500"
                }`}
            >
                Stand
            </button>
        </div>
    );
}