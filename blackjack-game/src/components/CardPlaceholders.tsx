"use client";

import type {Card} from "@/types";

export default function CardPlaceholders({ cards, label, total }: { cards: Card[]; label: string; total: number }) {
    const showScore = cards.length > 0 && total > 0;

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Cards - Standard poker card ratio 2.5:3.5 (5:7) */}
            <div className="flex justify-center gap-4">
                {cards.length === 0 ? (
                    <>
                        {/* Card Back - Placeholder */}
                        <div className="w-[100px] h-[140px] bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 rounded-xl shadow-2xl flex items-center justify-center relative overflow-hidden border-4 border-pink-400">
                            {/* Diagonal stripe pattern */}
                            <div className="absolute inset-0 card-back opacity-50"></div>

                            {/* Center design */}
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="text-white text-4xl mb-1">♠</div>
                            </div>

                            {/* Border decoration */}
                            <div className="absolute inset-2 border-2 border-white/30 rounded-lg"></div>
                        </div>

                        <div className="w-[100px] h-[140px] bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 rounded-xl shadow-2xl flex items-center justify-center relative overflow-hidden border-4 border-pink-400">
                            <div className="absolute inset-0 card-back opacity-50"></div>
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="text-white text-4xl mb-1">♠</div>
                            </div>
                            <div className="absolute inset-2 border-2 border-white/30 rounded-lg"></div>
                        </div>
                    </>
                ) : (
                    cards.map((card, index) => (
                        <div
                            key={index}
                            className="w-[100px] h-[140px] bg-white rounded-xl shadow-2xl transform transition-all hover:scale-105 hover:-translate-y-2 animate-cardDeal flex flex-col items-center justify-between p-3 relative perspective-1000"
                            style={{
                                animationDelay: `${index * 150}ms`,
                                boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.1)'
                            }}
                        >
                            {/* Top left corner - number above suit */}
                            <div className="self-start flex flex-col items-center leading-none -mt-1">
                                <span className="text-2xl font-bold bg-gradient-to-br from-pink-500 to-pink-700 bg-clip-text text-transparent">
                                    {card.name}
                                </span>
                                <span className="text-lg text-pink-500 -mt-1">♠</span>
                            </div>

                            {/* Center value - large suit */}
                            <div className="flex flex-col items-center -my-2">
                                <span className="text-6xl text-pink-500">♠</span>
                            </div>

                            {/* Bottom right corner (rotated) - number above suit */}
                            <div className="self-end flex flex-col items-center leading-none rotate-180 -mb-1">
                                <span className="text-2xl font-bold bg-gradient-to-br from-pink-500 to-pink-700 bg-clip-text text-transparent">
                                    {card.name}
                                </span>
                                <span className="text-lg text-pink-500 -mt-1">♠</span>
                            </div>

                            {/* Subtle border */}
                            <div className="absolute inset-0 border border-gray-200 rounded-xl pointer-events-none"></div>
                        </div>
                    ))
                )}
            </div>

            {/* Label with score */}
            <div className="px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 shadow-lg">
                <p className="text-black font-semibold text-lg">
                    {showScore ? `${total} ` : ''}{label}
                </p>
            </div>
        </div>
    );
}