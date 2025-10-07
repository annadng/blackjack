"use client";

import { useState, useEffect, useRef } from "react";
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

    const prevChipsRef = useRef<number>(chips);
    const [shouldPulse, setShouldPulse] = useState(false);
    const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (chips > prevChipsRef.current) {
            setShouldPulse(true);
            pulseTimeoutRef.current = setTimeout(() => setShouldPulse(false), 600);
        }
        prevChipsRef.current = chips;

        return () => {
            if (pulseTimeoutRef.current) {
                clearTimeout(pulseTimeoutRef.current);
            }
        };
    }, [chips]);

    const handleHistoryClick = () => {
        if (onHistoryClick) return onHistoryClick();
        router.push("/history");
    };

    const navigateHome = () => router.push("/");

    return (
        <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
            <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                {/* Logo and Chips */}
                <div className="flex items-center gap-2 sm:gap-4 md:gap-8">
                    <button
                        onClick={navigateHome}
                        className="text-lg sm:text-xl md:text-2xl font-bold text-black hover:text-pink-200 transition-colors tracking-tight"
                    >
                        ♠<span className="hidden sm:inline"> Blackjack</span>
                    </button>

                    {chips >= 0 && (
                        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-pink-500 to-pink-600">
                            <span className="text-base sm:text-xl">💰</span>
                            <span className={`text-white text-sm sm:text-base font-semibold ${shouldPulse ? "animate-pulse" : ""}`}>
                                ${chips.toLocaleString()}
                            </span>
                            {onBuyChipsClick && (
                                <button
                                    onClick={onBuyChipsClick}
                                    className="ml-1 sm:ml-2 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full bg-white/30 hover:bg-white/40 text-white text-sm sm:text-base font-bold transition-all"
                                >
                                    +
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation Links & Session */}
                <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
                    <button
                        onClick={navigateHome}
                        className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base text-black hover:text-white font-medium transition-colors"
                    >
                        Home
                    </button>
                    <button
                        onClick={handleHistoryClick}
                        className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base text-black hover:text-white font-medium transition-colors"
                    >
                        History
                    </button>

                    {session ? (
                        <button
                            onClick={() => signOut()}
                            className="px-3 sm:px-6 py-1.5 sm:py-2 bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm md:text-base rounded-full font-medium transition-all"
                        >
                            Logout
                        </button>
                    ) : (
                        <button
                            onClick={() => router.push("/login")}
                            className="px-3 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-xs sm:text-sm md:text-base rounded-full font-medium transition-all"
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
