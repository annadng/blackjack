"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useMemo } from "react";
import Navigation from "@/components/Navigation";
import BuyChipsModal from "@/components/BuyChipsModal";
import { useChips } from "@/hooks/useChips";
import { useGameHistory } from "@/hooks/useGameHistory";
import { useGuestStorage } from "@/hooks/useGuestStorage";

const ITEMS_PER_PAGE = 10;

export default function HistoryPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const username = session?.user?.email;
    const isGuest = !username;
    const [showBuyChips, setShowBuyChips] = useState(false);
    const [guestPage, setGuestPage] = useState(1);

    // Guest storage
    const { guestChips, guestHistory, addGuestChips } = useGuestStorage();

    // Server-side data for logged-in users
    const { currentChips, refetchChips } = useChips(username, guestChips);
    const {
        history: serverHistory,
        loading,
        error,
        currentPage: serverPage,
        totalPages: serverTotalPages,
        goToPage: serverGoToPage
    } = useGameHistory(username);

    // Guest pagination (client-side)
    const guestTotalPages = Math.ceil(guestHistory.length / ITEMS_PER_PAGE);
    const guestPaginatedHistory = useMemo(() => {
        const startIndex = (guestPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return guestHistory.slice(startIndex, endIndex);
    }, [guestHistory, guestPage]);

    const guestGoToPage = (page: number) => {
        if (page >= 1 && page <= guestTotalPages) {
            setGuestPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Use appropriate data based on login status
    const history = isGuest ? guestPaginatedHistory : serverHistory;
    const currentPage = isGuest ? guestPage : serverPage;
    const totalPages = isGuest ? guestTotalPages : serverTotalPages;
    const goToPage = isGuest ? guestGoToPage : serverGoToPage;

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

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 7;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const totalGames = isGuest ? guestHistory.length : (isGuest ? 0 : totalPages * ITEMS_PER_PAGE);

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
                                Playing as Guest • History is stored locally •
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
                                                        {game.winnings > 0 ? `+${game.winnings}` :
                                                            game.winnings < 0 ? `-${Math.abs(game.winnings)}` :
                                                                '$0'}
                                                    </p>
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
                                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalGames)} of {totalGames} games
                                    </span>
                                    <div className="flex gap-4">
                                        <span className="text-gray-400">
                                            Wins: <span className="text-green-600">{(isGuest ? guestHistory : []).filter((g: any) => g.result === "win").length}</span>
                                        </span>
                                        <span className="text-gray-400">
                                            Losses: <span className="text-red-600">{(isGuest ? guestHistory : []).filter((g: any) => g.result === "lose").length}</span>
                                        </span>
                                        <span className="text-gray-400">
                                            Pushes: <span className="text-yellow-600">{(isGuest ? guestHistory : []).filter((g: any) => g.result === "push").length}</span>
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