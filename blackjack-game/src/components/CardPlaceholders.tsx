"use client";

import type {Card} from "@/types";

export default function CardPlaceholders({ cards, label, total }: { cards: Card[]; label: string; total: number }) {
    const showScore = cards.length > 0;

    return (
        <div className="mb-12">
            <div className="text-center mb-8">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-light">
                    {label}
                    {showScore && (
                        <span className="ml-3 text-[#ffb5c0]">{total}</span>
                    )}
                </p>
            </div>
            <div className="flex justify-center gap-4 min-h-[160px] items-center">
                {cards.length === 0 ? (
                    <div className="w-24 h-36 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center">
                        <span className="text-gray-300 text-2xl">?</span>
                    </div>
                ) : (
                    cards.map((card, index) => (
                        <div
                            key={index}
                            className="w-24 h-36 bg-white border-2 border-gray-300 rounded-xl shadow-xl transform transition-all hover:scale-105 animate-cardDeal overflow-hidden flex items-center justify-center"
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            <span className="text-3xl font-bold text-gray-800">{card.name}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}