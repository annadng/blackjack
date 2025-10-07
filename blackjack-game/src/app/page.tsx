"use client";

import { useEffect, useState, useRef } from "react";
import Navigation from "@/components/Navigation";
import CardPlaceholder from "@/components/CardPlaceholders";
import AISuggestion from "@/components/AIAssistant";
import BetControls from "@/components/BetControls";
import GameControls from "@/components/GameControls";
import GameResult from "@/components/GameResults";
import BuyChipsModal from "@/components/BuyChipsModal";
import InsufficientChipsModal from "@/components/InsufficientChipsModal";
import { useSession } from "next-auth/react";
import { useBetting } from "@/hooks/useBetting";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { useChips } from "@/hooks/useChips";
import { useBlackjack } from "@/hooks/useBlackjack";
import { useGameHistory } from "@/hooks/useGameHistory";
import { useGuestStorage } from "@/hooks/useGuestStorage";
import { useGuestGame } from "@/hooks/useGuestGame";

export default function GamePage() {
    const { data: session } = useSession();
    const username = session?.user?.email;
    const isGuest = !username;

    // Guest storage
    const {guestChips, isLoaded, deductGuestChips, addGuestChips, addGuestHistory} = useGuestStorage();

    // Server-side game (logged in users)
    const serverGame = useBlackjack();

    // Client-side game (guest users)
    const guestGame = useGuestGame();

    // Use appropriate game based on login status
    const game = isGuest ? guestGame : serverGame;

    // Custom hooks
    const { currentChips, loading: chipsLoading, refetchChips } = useChips(username, guestChips, isLoaded);
    const [showBuyChips, setShowBuyChips] = useState(false);
    const { bet, addBet, resetBet, validateBet } = useBetting();
    const { aiSuggestion, highlightAction, loading: aiLoading, askAI, resetAI } = useAIAssistant();
    const { saveGame } = useGameHistory(username ?? undefined);
    const [showInsufficientChips, setShowInsufficientChips] = useState(false);

    // Track if we've already saved this game to prevent duplicates
    const savedGameRef = useRef<string | null>(null);

    // Hydration fix
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    useEffect(() => {
        // Only save when game ends with valid data (guests only - logged-in users saved by server)
        if (game.result && bet > 0 && game.playerTotal > 0 && game.dealerTotal > 0 && isGuest) {
            // Create unique identifier for this game
            const gameId = `${game.result}-${game.playerTotal}-${game.dealerTotal}-${bet}`;

            // Check if we've already saved this exact game
            if (savedGameRef.current === gameId) {
                return;
            }

            savedGameRef.current = gameId;
            const winnings =
                game.result === "blackjack" ? bet * 1.5 :
                game.result === "win" ? bet :
                game.result === "lose" ? -bet :
                0;

            // Save to sessionStorage for guests
            const gameData = {
                id: `guest-${Date.now()}`,
                username: "Guest",
                timestamp: Date.now(),
                bet,
                result: game.result,
                playerTotal: game.playerTotal,
                dealerTotal: game.dealerTotal,
                playerCards: game.playerCards,
                dealerCards: game.dealerCards,
                winnings
            };
            addGuestHistory(gameData);

            // Update guest chips
            if (game.result === "blackjack") {
                addGuestChips(bet + bet * 1.5); // Return bet + 1.5x winnings = 2.5x total
            } else if (game.result === "win") {
                addGuestChips(bet * 2); // Return bet + 1x winnings = 2x total
            } else if (game.result === "push") {
                addGuestChips(bet); // Return bet only
            }
        }
    }, [game.result, game.playerTotal, game.dealerTotal, bet, isGuest, addGuestHistory, addGuestChips]);

    // Reset saved game tracking when new game starts
    useEffect(() => {
        if (!game.result) {
            savedGameRef.current = null;
        }
    }, [game.result]);

    // Refetch chips when game ends (for logged-in users)
    useEffect(() => {
        if (game.result && !isGuest && username) {
            refetchChips();
        }
    }, [game.result, isGuest, username, refetchChips]);

    const handlePlaceBet = async () => {
        if (!validateBet()) return;

        if (isGuest) {
            const success = await deductGuestChips(bet);
            if (!success) {
                setShowInsufficientChips(true);
                return;
            }
            guestGame.dealInitialCards();
        } else if (username) {
            const success = await serverGame.dealInitialCards(username, bet);
            if (!success) {
                setShowInsufficientChips(true);
                return;
            }
            // Refetch chips after bet is placed
            refetchChips();
        }

        resetAI();
    };

    const handleHit = () => {
        if (isGuest) {
            guestGame.hit();
        } else if (username) {
            serverGame.hit(username);
        }
        resetAI();
    };

    const handleStand = () => {
        if (isGuest) {
            guestGame.stand();
        } else if (username) {
            serverGame.stand(username);
        }
        resetAI();
    };

    const handleNewGame = () => {
        game.resetGame();
        resetBet();
        resetAI();
    };

    const handleAskAI = () => {
        askAI(game.playerCards, game.dealerCards);
    };

    const handleBuyChipsSuccess = () => {
        refetchChips();
    };

    if (!mounted) {
        return <div className="min-h-screen bg-[#fccfcf]" />;
    }

    return (
        <div className="min-h-screen bg-[#fccfcf]">
            <Navigation
                chips={currentChips}
                onBuyChipsClick={() => setShowBuyChips(true)}
            />

            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="bg-white rounded-2xl border border-gray-100 p-12 shadow-sm">
                    {isGuest && (
                        <div className="mb-6 text-center">
                            <p className="text-xs text-gray-400">
                                Playing as Guest • <button onClick={() => {}} className="text-[#ffb5c0] hover:underline">Sign in</button> to save progress
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <CardPlaceholder cards={game.dealerCards} total={game.dealerTotal} label="Dealer" />
                        <CardPlaceholder cards={game.playerCards} total={game.playerTotal} label="You" />
                    </div>

                    {game.result && (
                        <div className="text-center mb-6 animate-fadeIn">
                            <GameResult
                                result={game.result}
                                playerTotal={game.playerTotal}
                                onNewGame={handleNewGame}
                            />
                        </div>
                    )}

                    <div className="border-gray-100 pt-8">
                        <div className="flex flex-col items-center gap-6">
                            {!game.gameActive && !game.result && (
                                <>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-400 mb-1">Current Bet</p>
                                        <p className="text-2xl font-light text-gray-900">${bet}</p>
                                    </div>
                                    <BetControls
                                        bet={bet}
                                        onSelectBet={addBet}
                                        onPlaceBet={handlePlaceBet}
                                        disabled={chipsLoading}
                                    />
                                </>
                            )}

                            {game.gameActive && (
                                <GameControls
                                    onHit={handleHit}
                                    onStand={handleStand}
                                    onAskAI={handleAskAI}
                                    highlightAction={highlightAction}
                                    aiLoading={aiLoading}
                                />
                            )}

                            <AISuggestion
                                suggestion={aiSuggestion}
                                playerTotal={game.playerTotal}
                            />
                        </div>
                    </div>
                </div>
            </main>

            <InsufficientChipsModal
                isOpen={showInsufficientChips}
                onClose={() => setShowInsufficientChips(false)}
                onBuyChips={() => setShowBuyChips(true)}
                requiredAmount={bet}
                currentChips={currentChips}
            />

            <BuyChipsModal
                isOpen={showBuyChips}
                onClose={() => setShowBuyChips(false)}
                username={username}
                isGuest={isGuest}
                onSuccess={handleBuyChipsSuccess}
                onGuestAddChips={addGuestChips}
            />
        </div>
    );
}