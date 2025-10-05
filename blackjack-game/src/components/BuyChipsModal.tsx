"use client";

import { useState } from "react";

interface BuyChipsModalProps {
    isOpen: boolean;
    onClose: () => void;
    username: string | null | undefined;
    onSuccess: () => void;
}

const CHIP_PACKAGES = [
    { amount: 100, label: "100 Chips" },
    { amount: 500, label: "500 Chips" },
    { amount: 1000, label: "1,000 Chips" },
    { amount: 5000, label: "5,000 Chips" },
];

export default function BuyChipsModal({ isOpen, onClose, username, onSuccess }: BuyChipsModalProps) {
    const [loading, setLoading] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

    if (!isOpen) return null;

    const handleBuy = async () => {
        if (!selectedAmount || !username) return;

        setLoading(true);
        try {
            const res = await fetch("/api/chips/buy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    amount: selectedAmount,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                onSuccess();
                onClose();
                setSelectedAmount(null);
            } else {
                alert(data.error || "Failed to add chips");
            }
        } catch (error) {
            console.error("Failed to add chips:", error);
            alert("Failed to add chips");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-gray-100 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-light text-gray-800">Buy Chips</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                    >
                        ×
                    </button>
                </div>

                <p className="text-sm text-gray-500 mb-6">
                    Select the amount of chips you want to purchase
                </p>

                <div className="space-y-3 mb-6">
                    {CHIP_PACKAGES.map((pkg) => (
                        <button
                            key={pkg.amount}
                            type="button"
                            onClick={() => setSelectedAmount(pkg.amount)}
                            className={`w-full p-4 rounded-lg border transition-all ${
                                selectedAmount === pkg.amount
                                    ? "border-[#ffb5c0] bg-[#ffb5c0]/5"
                                    : "border-gray-200 hover:border-[#ffb5c0]/50"
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 font-light">{pkg.label}</span>
                                <span className="text-[#ffb5c0] font-light text-sm">Free</span>
                            </div>
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={handleBuy}
                    disabled={!selectedAmount || loading}
                    className="w-full px-6 py-3 bg-[#ffb5c0] hover:bg-[#ff9eb0] text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Adding..." : "Add Chips"}
                </button>
            </div>
        </div>
    );
}