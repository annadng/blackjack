"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

interface NavigationProps {
    chips: number;
    onHistoryClick?: () => void;
    onBuyChipsClick?: () => void;
}

export default function Navigation({ chips, onHistoryClick, onBuyChipsClick }: NavigationProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [prevChips, setPrevChips] = useState(chips);
    const [shouldPulse, setShouldPulse] = useState(false);

    useEffect(() => {
        if (chips > prevChips) {
            setShouldPulse(true);
            setTimeout(() => setShouldPulse(false), 600);
        }
        setPrevChips(chips);
    }, [chips, prevChips]);

    const handleHistoryClick = () => {
        if (onHistoryClick) {
            onHistoryClick();
        } else {
            router.push("/history");
        }
    };

    return (
        <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => router.push("/")}
                        className="text-2xl font-bold text-black hover:text-pink-200 transition-colors tracking-tight"
                    >
                        ♠ Blackjack
                    </button>

                    {chips >= 0 && (
                        <div className="flex items-center gap-3">
                            <div className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 shadow-lg">
                                <span className={`text-white font-semibold ${shouldPulse ? "animate-pulse" : ""}`}>
                                    ${chips.toLocaleString()}
                                </span>
                            </div>
                            {onBuyChipsClick && (
                                <button
                                    onClick={onBuyChipsClick}
                                    className="px-3 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-all"
                                >
                                    + Add
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push("/")}
                        className="px-4 py-2 text-black hover:text-white font-medium transition-colors"
                    >
                        Home
                    </button>
                    <button
                        onClick={handleHistoryClick}
                        className="px-4 py-2 text-black hover:text-white font-medium transition-colors"
                    >
                        History
                    </button>
                    {session ? (
                        <button
                            onClick={() => signOut()}
                            className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full font-medium transition-all"
                        >
                            Logout
                        </button>
                    ) : (
                        <button
                            onClick={() => {}}
                            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-full font-medium shadow-lg transition-all"
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}