import { useState } from "react";
import type {ActionType} from "./useBlackjack";
import type {Card} from "@/types";

export function useAIAssistant() {
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const [highlightAction, setHighlightAction] = useState<ActionType>(null);
    const [loading, setLoading] = useState(false);

    const askAI = async (playerCards: Card[], dealerCards: Card[]) => {
        setLoading(true);
        try {
            // Convert cards to readable format for AI
            const playerHand = playerCards.map(card => card.name);
            const dealerCard = dealerCards.length > 0 ? dealerCards[0].name : "";

            const response = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    playerHand,
                    dealerCard,
                }),
            });

            const data = await response.json();
            const suggestion = data.recommendation?.toLowerCase();

            setAiSuggestion(suggestion);
            setHighlightAction(suggestion as ActionType);
        } catch (err) {
            console.error("AI request failed:", err);
            setAiSuggestion("Unknown");
            setHighlightAction(null);
        } finally {
            setLoading(false);
        }
    };

    const resetAI = () => {
        setAiSuggestion(null);
        setHighlightAction(null);
        setLoading(false);
    };

    return {
        aiSuggestion,
        highlightAction,
        loading,
        askAI,
        resetAI,
    };
}