"use client";

interface AIAssistantProps {
    suggestion: string | null;
    playerTotal: number;
}

export default function AIAssistant({ suggestion, playerTotal }: AIAssistantProps) {
    if (!suggestion) return null;

    const getExplanation = () => {
        if (suggestion.toLowerCase() === "stand") {
            return `Dealer's upcard is weak; stand on ${playerTotal}.`;
        } else if (suggestion.toLowerCase() === "hit") {
            return `Your ${playerTotal} is too low against dealer's upcard; hit to improve.`;
        }
        return null;
    };

    const explanation = getExplanation();

    return (
        <div className="mt-2 text-center">
            <div className="text-pink-600 font-bold text-lg">
                AI suggests: {suggestion}
            </div>
            {explanation && (
                <div className="text-pink-600 text-sm mt-1">
                    {explanation}
                </div>
            )}
        </div>
    );
}