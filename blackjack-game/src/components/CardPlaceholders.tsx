import type {Card} from "@/types";

export default function CardPlaceholders({ cards, label, total }: { cards: Card[]; label: string; total: number }) {
    return (
        <div className="flex flex-col items-center space-y-2">
            <div className="flex space-x-2">
                {cards.map((c, idx) => (
                    <div key={idx} className="w-16 h-24 bg-white rounded shadow flex items-center justify-center text-xl">
                        {c.name}
                    </div>
                ))}
            </div>
            <div className="text-lg font-bold">{total} {label}</div>
        </div>
    );
}
