"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface NavigationProps {
    chips: number;
    onHistoryClick?: () => void;
    onBuyChipsClick?: () => void;
}

export default function Navigation({ chips, onHistoryClick, onBuyChipsClick }: NavigationProps) {
    const router = useRouter();
    const [prevChips, setPrevChips] = useState(chips);
    const [shouldPulse, setShouldPulse] = useState(false);

    useEffect(() => {
        if (chips > prevChips) {
            setShouldPulse(true);
            setTimeout(() => setShouldPulse(false), 500);
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
        <nav className="bg-white border-b border-gray-100 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => router.push("/")}
                        className="text-xl font-light text-gray-800 tracking-wide hover:text-[#ffb5c0] transition-colors"
                    >
                        Blackjack
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#ffb5c0]/30 bg-[#ffb5c0]/5">
                            <span className={`text-sm text-gray-600 ${shouldPulse ? "animate-pulse" : ""}`}>
                                ${chips}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={onBuyChipsClick}
                            className="px-3 py-1.5 text-xs bg-[#ffb5c0] hover:bg-[#ff9eb0] text-white rounded-full transition-colors"
                        >
                            + Add
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleHistoryClick}
                        className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        History
                    </button>
                    <button
                        type="button"
                        className="px-4 py-1.5 text-sm bg-[#ffb5c0] hover:bg-[#ff9eb0] text-white rounded-full transition-colors"
                    >
                        Login
                    </button>
                </div>
            </div>
        </nav>
    );
}