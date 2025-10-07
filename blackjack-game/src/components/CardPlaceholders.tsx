"use client";

import type { Card } from "@/types";

export default function CardPlaceholders({
                                             cards,
                                             label,
                                             total,
                                         }: {
    cards: Card[];
    label: string;
    total: number;
}) {
    const showScore = cards.length > 0 && total > 0;

    return (
        <div className="flex flex-col items-center gap-3">
            {/* Cards - Standard poker card ratio 2.5:3.5 (5:7) */}
            <div className="flex justify-center gap-3">
                {cards.length === 0 ? (
                    <>
                        {[0, 1].map((i) => (
                            <div
                                key={i}
                                className="w-[100px] h-[140px] bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 rounded-xl flex items-center justify-center relative overflow-hidden border-4 border-pink-400"
                            >
                                <div className="absolute inset-0 card-back opacity-50"></div>
                                <div className="relative z-10 flex items-center justify-center">
                                    <div className="text-white text-3xl">♠</div>
                                </div>
                                <div className="absolute inset-2 border-2 border-white/30 rounded-lg"></div>
                            </div>
                        ))}
                    </>
                ) : (
                    cards.map((card, index) => (
                        <div
                            key={index}
                            className="w-[100px] h-[140px] bg-white rounded-xl transform transition-all hover:scale-105 hover:-translate-y-1 animate-cardDeal flex flex-col justify-between p-2 relative perspective-1000 overflow-hidden"
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            {/* Top left corner */}
                            <div className="self-start flex flex-col items-center leading-none -mt-1">
                <span className="text-lg font-bold bg-gradient-to-br from-pink-500 to-pink-700 bg-clip-text text-transparent">
                  {card.name}
                </span>
                                <span className="text-sm text-pink-500 -mt-0.5">♠</span>
                            </div>

                            {/* Center value */}
                            <div className="flex items-center justify-center -my-1">
                                <span className="text-3xl text-pink-500">♠</span>
                            </div>

                            {/* Bottom right corner */}
                            <div className="self-end flex flex-col items-center leading-none rotate-180 -mb-1">
                <span className="text-lg font-bold bg-gradient-to-br from-pink-500 to-pink-700 bg-clip-text text-transparent">
                  {card.name}
                </span>
                                <span className="text-sm text-pink-500 -mt-0.5">♠</span>
                            </div>

                            {/* Border */}
                            <div className="absolute inset-0 border-1 border-gray-200 rounded-xl pointer-events-none"></div>
                        </div>
                    ))
                )}
            </div>
            
            <div className="px-4 py-1 bg- backdrop-blur-sm rounded">
                <p className="text-black font-semibold text-sm">
                    {showScore ? `${total} ` : ""}
                    {label}
                </p>
            </div>
        </div>
    );
}
