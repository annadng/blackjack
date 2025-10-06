"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import CardPlaceholder from "@/components/CardPlaceholders";
import AISuggestion from "@/components/AIAssistant";
import BetControls from "@/components/BetControls";
import GameControls from "@/components/GameControls";
import GameResult from "@/components/GameResults";
import BuyChipsModal from "@/components/BuyChipsModal";
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
    const {guestChips, deductGuestChips, addGuestChips, addGuestHistory} = useGuestStorage();

    // Server-side game (logged in users)
    const serverGame = useBlackjack();

    // Client-side game (guest users)
    const guestGame = useGuestGame();

    // Use appropriate game based on login status
    const game = isGuest ? guestGame : serverGame;
    
    // Custom hooks
    const { currentChips, refetchChips } = useChips(username, guestChips);
    const [showBuyChips, setShowBuyChips] = useState(false);
    const { bet, addBet, resetBet, validateBet } = useBetting();
    const { aiSuggestion, highlightAction, askAI, resetAI } = useAIAssistant();
    const { saveGame } = useGameHistory(username);

    useEffect(() => {
        if (game.result && bet > 0) {
            const winnings = game.result === "win" ? bet : game.result === "lose" ? -bet : 0;

            if (isGuest) {
                // Save to localStorage for guests
                const gameData = {id: `guest-${Date.now()}`, username: "Guest", timestamp: Date.now(), bet,
                    result: game.result,
                    playerTotal: game.playerTotal,
                    dealerTotal: game.dealerTotal,
                    playerCards: game.playerCards,
                    dealerCards: game.dealerCards,
                    winnings
                };
                addGuestHistory(gameData);

                // Update guest chips
                if (game.result === "win") {
                    addGuestChips(bet);
                } else if (game.result === "push") {
                    addGuestChips(bet);
                }
            } else if (username) {
                // Save to database for logged-in users
                saveGame({username, bet, result: game.result, playerTotal: game.playerTotal, dealerTotal: game.dealerTotal, 
                    playerCards: game.playerCards,
                    dealerCards: game.dealerCards,
                    winnings
                });
            }
        }
    }, [game.result, bet, game.playerTotal, game.dealerTotal, game.playerCards, game.dealerCards, isGuest, username, saveGame, addGuestHistory, addGuestChips]);

    const handlePlaceBet = async () => {
        if (!validateBet()) return;

        if (isGuest) {
            // Deduct chips for guest
            const success = deductGuestChips(bet);
            if (!success) {
                alert("Insufficient chips");
                return;
            }
            game.dealInitialCards;
        } else if (username) {
            // Server-side game for logged-in users
            const success = await serverGame.dealInitialCards(username, bet);
            if (!success) return;
        }

        resetAI();
    };

    const handleHit = () => {
        if (isGuest) {
            game.hit;
        } else if (username) {
            serverGame.hit(username);
        }
        resetAI();
    };

    const handleStand = () => {
        if (isGuest) {
            game.stand;
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
        if (!isGuest) {
            refetchChips();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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

                    <CardPlaceholder cards={game.dealerCards} total={game.dealerTotal} label="Dealer" />
                    <CardPlaceholder cards={game.playerCards} total={game.playerTotal} label="You" />


                    {game.result && (
                        <div className="text-center mb-6 animate-fadeIn">
                            <GameResult
                                result={game.result}
                                playerTotal={game.playerTotal}
                                onNewGame={handleNewGame}
                            />
                        </div>
                    )}

                    <div className="border-t border-gray-100 pt-8">
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
                                    />
                                </>
                            )}

                            {game.gameActive && (
                                <GameControls
                                    onHit={handleHit}
                                    onStand={handleStand}
                                    onAskAI={handleAskAI}
                                    highlightAction={highlightAction}
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