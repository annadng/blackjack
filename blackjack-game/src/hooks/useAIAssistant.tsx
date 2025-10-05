import { useState } from "react";
import type {ActionType} from "./useBlackjack";
import type {Card} from "@/types";

export function useAIAssistant() {
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const [highlightAction, setHighlightAction] = useState<ActionType>(null);

    const askAI = async (playerCards: Card[], dealerCards: Card[]) => {
        try {
            const response = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    playerCards,
                    dealerCards,
                }),
            });

            const data = await response.json();
            const suggestion = data.recommendation;

            setAiSuggestion(suggestion);
            setHighlightAction(suggestion as ActionType);
        } catch (err) {
            console.error("AI request failed:", err);
            setAiSuggestion("Unknown");
            setHighlightAction(null);
        }
    };

    const resetAI = () => {
        setAiSuggestion(null);
        setHighlightAction(null);
    };

    return {
        aiSuggestion,
        highlightAction,
        askAI,
        resetAI,
    };
}