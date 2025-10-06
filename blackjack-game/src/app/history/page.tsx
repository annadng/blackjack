"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Navigation from "@/components/Navigation";
import BuyChipsModal from "@/components/BuyChipsModal";
import { useChips } from "@/hooks/useChips";
import { useGameHistory } from "@/hooks/useGameHistory";
import { useGuestStorage } from "@/hooks/useGuestStorage";

export default function HistoryPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const username = session?.user?.email;
    const isGuest = !username;
    const [showBuyChips, setShowBuyChips] = useState(false);

    // Guest storage
    const { guestChips, guestHistory, addGuestChips } = useGuestStorage();

    // Server-side data for logged-in users
    const { currentChips, refetchChips } = useChips(username, guestChips);
    const { history: serverHistory, loading, error, hasMore, loadMore, loadingMore } = useGameHistory(username);

    // Use appropriate history based on login status
    const history = isGuest ? guestHistory : serverHistory;

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getResultColor = (result: string) => {
        if (result === "win") return "text-green-600";
        if (result === "lose") return "text-red-600";
        return "text-yellow-600";
    };

    const getResultBadge = (result: string) => {
        if (result === "win") return "bg-green-100 text-green-700";
        if (result === "lose") return "bg-red-100 text-red-700";
        return "bg-yellow-100 text-yellow-700";
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
                onHistoryClick={() => router.push("/history")}
                onBuyChipsClick={() => setShowBuyChips(true)}
            />

            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="bg-white rounded-2xl border border-gray-100 p-12 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-light text-gray-800">Game History</h2>
                        <button
                            type="button"
                            onClick={() => router.push("/")}
                            className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
                        >
                            ← Back to Game
                        </button>
                    </div>

                    {isGuest && (
                        <div className="mb-6 text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">
                                Game History
                                <button onClick={() => {}} className="text-[#ffb5c0] hover:underline ml-1">Sign in</button> to sync across devices
                            </p>
                        </div>
                    )}

                    {!isGuest && loading && (
                        <div className="text-gray-400 text-center py-12">
                            <p className="text-sm">Loading history...</p>
                        </div>
                    )}

                    {!isGuest && error && (
                        <div className="text-red-400 text-center py-12">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {history.length === 0 && !loading && (
                        <div className="text-gray-400 text-center py-12">
                            <p className="text-sm">No games played yet</p>
                            <p className="text-xs mt-2">Your game history will appear here</p>
                        </div>
                    )}

                    {history.length > 0 && (
                        <>
                            <div className="space-y-3">
                                {history.map((game) => (
                                    <div
                                        key={game.id}
                                        className="border border-gray-100 rounded-lg p-6 hover:border-[#ffb5c0]/30 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-400 mb-1">Date</p>
                                                    <p className="text-sm text-gray-700 font-light">
                                                        {formatDate(game.timestamp)}
                                                    </p>
                                                </div>

                                                <div className="text-center">
                                                    <p className="text-xs text-gray-400 mb-1">Bet</p>
                                                    <p className="text-sm text-gray-700 font-light">
                                                        ${game.bet}
                                                    </p>
                                                </div>

                                                <div className="text-center">
                                                    <p className="text-xs text-gray-400 mb-1">Your Hand</p>
                                                    <p className="text-sm text-gray-700 font-light">
                                                        {game.playerCards.map((c: any) => c.name).join(", ")}
                                                        <span className="ml-2 text-[#ffb5c0]">({game.playerTotal})</span>
                                                    </p>
                                                </div>

                                                <div className="text-center">
                                                    <p className="text-xs text-gray-400 mb-1">Dealer Hand</p>
                                                    <p className="text-sm text-gray-700 font-light">
                                                        {game.dealerCards.map((c: any) => c.name).join(", ")}
                                                        <span className="ml-2 text-gray-400">({game.dealerTotal})</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-400 mb-1">Result</p>
                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-light ${getResultBadge(game.result)}`}>
                                                        {game.result.toUpperCase()}
                                                    </span>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-xs text-gray-400 mb-1">Winnings</p>
                                                    <p className={`text-lg font-light ${getResultColor(game.result)}`}>
                                                        {game.winnings > 0 ? `+$${game.winnings}` :
                                                            game.winnings < 0 ? `-$${Math.abs(game.winnings)}` :
                                                                '$0'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Load More Button (only for logged-in users) */}
                            {!isGuest && hasMore && (
                                <div className="flex justify-center mt-6">
                                    <button
                                        type="button"
                                        onClick={loadMore}
                                        disabled={loadingMore}
                                        className="px-6 py-2 bg-[#ffb5c0] hover:bg-[#ff9eb0] text-white text-sm rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loadingMore ? "Loading..." : "Load More"}
                                    </button>
                                </div>
                            )}

                            {/* Stats Summary */}
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">
                                        Total Games: <span className="text-gray-700">{history.length}</span>
                                    </span>
                                    <div className="flex gap-4">
                                        <span className="text-gray-400">
                                            Wins: <span className="text-green-600">{history.filter((g: any) => g.result === "win").length}</span>
                                        </span>
                                        <span className="text-gray-400">
                                            Losses: <span className="text-red-600">{history.filter((g: any) => g.result === "lose").length}</span>
                                        </span>
                                        <span className="text-gray-400">
                                            Pushes: <span className="text-yellow-600">{history.filter((g: any) => g.result === "push").length}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
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