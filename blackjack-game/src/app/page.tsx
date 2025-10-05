"use client";

import Navigation from "@/components/Navigation";
import CardPlaceholder from "@/components/CardPlaceholders";
import AISuggestion from "@/components/AIAssistant";
import BetControls from "@/components/BetControls";
import GameControls from "@/components/GameControls";
import GameResult from "@/components/GameResults";
import { useSession } from "next-auth/react";
import { useBetting } from "@/hooks/useBetting";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { useChips } from "@/hooks/useChips";
import { useBlackjack } from "@/hooks/useBlackjack";

export default function GamePage() {
    const { data: session } = useSession();
    const username = session?.user?.email;
    
    // Custom hooks
    const { currentChips } = useChips(username);
    const { bet, addBet, resetBet, validateBet } = useBetting();
    const { aiSuggestion, highlightAction, askAI, resetAI } = useAIAssistant();
    const {dealerCards, playerCards, dealerTotal, playerTotal, gameActive, result, dealInitialCards, hit, stand, resetGame,
    } = useBlackjack();
    
    const handlePlaceBet = () => {
        if (!validateBet()) return;
        dealInitialCards();
        resetAI();
    };

    const handleHit = () => {
        hit();
        resetAI();
    };

    const handleStand = () => {
        stand();
        resetAI();
    };

    const handleNewGame = () => {
        resetGame();
        resetBet();
        resetAI();
    };

    const handleAskAI = () => {
        askAI(playerCards, dealerCards);
    };

    return (
        <div className="min-h-screen bg-pink-50 text-pink-900 font-sans">
            <Navigation chips={currentChips} />

            {/* Game area */}
            <main className="flex flex-col items-center p-6 space-y-6">
                <CardPlaceholder cards={dealerCards} total={dealerTotal} label="Dealer" />
                <CardPlaceholder cards={playerCards} total={playerTotal} label="You" />

                {!gameActive && !result && (
                    <BetControls bet={bet} onSelectBet={addBet} onPlaceBet={handlePlaceBet} />
                )}

                {gameActive && (
                    <GameControls
                        onHit={handleHit}
                        onStand={handleStand}
                        onAskAI={handleAskAI}
                        highlightAction={highlightAction}
                    />
                )}

                <AISuggestion
                    suggestion={aiSuggestion}
                    playerTotal={playerTotal}
                />

                {!gameActive && result && (
                    <GameResult result={result} playerTotal={playerTotal} onNewGame={handleNewGame} />
                )}
            </main>
        </div>
    );

}