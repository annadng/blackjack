"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import BuyChipsModal from "@/components/BuyChipsModal";
import { useChips } from "@/hooks/useChips";
import { useGameHistory } from "@/hooks/useGameHistory";
import { useGuestStorage } from "@/hooks/useGuestStorage";

export default function HistoryPage() {
    const router = useRouter();
    const { data: session } = useSession();

    // Determine username: email if logged in, undefined for guest
    const username = session?.user?.email;
    const isGuest = !session?.user?.email;

    const [showBuyChips, setShowBuyChips] = useState(false);

    // Guest storage for guest users
    const { guestChips, guestHistory, isLoaded, addGuestChips } = useGuestStorage();

    // Chips hook
    const { currentChips, refetchChips } = useChips(username, guestChips, isLoaded);

    // Game history hook (fetches from DynamoDB for logged-in users)
    const {
        history: serverHistory,
        loading: historyLoading,
        error: historyError,
        currentPage: serverCurrentPage,
        totalPages: serverTotalPages,
        goToPage: serverGoToPage
    } = useGameHistory(isGuest ? undefined : username);

    // Guest pagination state
    const [guestCurrentPage, setGuestCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Use guest history or server history based on login status
    const sortedHistory = (isGuest ? guestHistory : serverHistory)
        .slice()
        .sort((a, b) => b.timestamp - a.timestamp);

    // Pagination
    const currentPage = isGuest ? guestCurrentPage : serverCurrentPage;
    const totalPages = isGuest
        ? Math.ceil(sortedHistory.length / ITEMS_PER_PAGE)
        : serverTotalPages;

    const goToPage = (page: number) => {
        if (isGuest) {
            setGuestCurrentPage(page);
        } else {
            serverGoToPage(page);
        }
    };

    // Get paginated history
    const history = isGuest
        ? sortedHistory.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
        )
        : sortedHistory;

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getResultBadge = (result: string) => {
        if (result === "win" || result === "blackjack") return "bg-green-100 text-green-700";
        if (result === "lose") return "bg-red-100 text-red-700";
        return "bg-yellow-100 text-yellow-700";
    };

    const handleBuyChipsSuccess = () => {
        refetchChips();
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 7;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push("...");
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1);
                pages.push("...");
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push("...");
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push("...");
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const totalGames = sortedHistory.length;

    // Ensure hydration consistency
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" />;

    return (
        <div className="min-h-screen bg-[#fccfcf]">
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
                                Playing as Guest • 
                                <button onClick={() => {}} className="text-[#ffb5c0] hover:underline ml-1">Sign in</button> to sync across devices
                            </p>
                        </div>
                    )}

                    {historyLoading && (
                        <div className="text-gray-400 text-center py-12">
                            <p className="text-sm">Loading history...</p>
                        </div>
                    )}

                    {historyError && (
                        <div className="text-red-400 text-center py-12">
                            <p className="text-sm">{historyError}</p>
                        </div>
                    )}

                    {history.length === 0 && !historyLoading && (
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
                                                <div>
                                                    <p className="text-xs text-gray-400 mb-1">Date</p>
                                                    <p className="text-sm text-gray-700 font-light">
                                                        {formatDate(game.timestamp)}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-gray-400 mb-1">Bet</p>
                                                    <p className="text-sm text-gray-700 font-light">
                                                        {game.bet} chips
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <div className="w-48">
                                                    <p className="text-xs text-gray-400 mb-1">Score</p>
                                                    <p className="text-sm text-gray-700 font-light">
                                                        You:{" "}
                                                        <span className="text-[#ffb5c0] font-medium">
                                                            {game.playerTotal || 0}
                                                        </span>
                                                        <span className="mx-2 text-gray-300">|</span>
                                                        Dealer:{" "}
                                                        <span className="text-gray-500 font-medium">
                                                            {game.dealerTotal || 0}
                                                        </span>
                                                    </p>
                                                </div>

                                                <div className="w-32 text-left" >
                                                    <p className="text-xs text-gray-400 mb-1">Result</p>
                                                    <span
                                                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-right ${getResultBadge(
                                                            game.result)}`}>
                                                    {game.result === "blackjack" ? `Blackjack (+${game.winnings})`
                                                        : game.result === "win" ? `Win (+${game.winnings})`
                                                        : game.result === "lose" ? "Lose" : "Push"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-8">
                                    <button
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        ← Prev
                                    </button>

                                    {getPageNumbers().map((page, index) => (
                                        page === '...' ? (
                                            <span key={`ellipsis-${index}`} className="px-2 text-gray-400">...</span>
                                        ) : (
                                            <button
                                                key={page}
                                                onClick={() => goToPage(page as number)}
                                                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                                                    currentPage === page
                                                        ? 'bg-[#ffb5c0] text-white'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        )
                                    ))}

                                    <button
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next →
                                    </button>
                                </div>
                            )}

                            {/* Stats Summary */}
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">
                                        Showing {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, totalGames)} of {totalGames} games
                                    </span>
                                    <div className="flex gap-4">
                                        <span className="text-gray-400">
                                            Blackjacks: <span className="text-purple-600">{history.filter((g: any) => g.result === "blackjack").length}</span>
                                        </span>
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
