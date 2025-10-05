import type {GameResult as GameResultType} from "@/hooks/useBlackjack";

interface GameResultProps {
    result: GameResultType;
    playerTotal: number;
    onNewGame: () => void;
}

export default function GameResult({ result, playerTotal, onNewGame }: GameResultProps) {
    if (!result) return null;

    return (
        <div className="flex flex-col items-center mt-4 space-y-2">
            <div
                className={`px-6 py-2 font-bold rounded ${
                    result === "win" ? "bg-green-500 text-white" : result === "lose" ? "bg-red-500 text-white" : "bg-yellow-400 text-white"
                }`}>
                {playerTotal} {result.toUpperCase()}
            </div>
            <button
                onClick={onNewGame}
                className="px-8 py-2 bg-pink-600 text-white font-bold rounded shadow hover:bg-pink-700"
            >
                New Game
            </button>
        </div>
    );
}