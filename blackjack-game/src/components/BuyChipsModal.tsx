"use client";

import { useState } from "react";

interface BuyChipsModalProps {
    isOpen: boolean;
    onClose: () => void;
    username?: string | null;
    isGuest?: boolean;
    onSuccess?: (newBalance: number) => void; // ✅ updated type
    onGuestAddChips?: (amount: number) => Promise<void>;
}

export default function BuyChipsModal({isOpen, onClose, username, isGuest = false, onSuccess, onGuestAddChips
                                      }: BuyChipsModalProps) {
    const [amount, setAmount] = useState(100);
    const [loading, setLoading] = useState(false);

    const chipOptions = [100, 500, 1000, 5000];

    const handleBuy = async () => {
        if (amount <= 0) return;
        if (!username && !isGuest) return;

        setLoading(true);

        try {
            if (isGuest && onGuestAddChips) {
                await onGuestAddChips(amount);
                // Don't call onSuccess for guests - the state update will trigger useChips automatically
            } else if (username) {
                const res = await fetch("/api/chips/buy", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, amount })
                });

                if (!res.ok) throw new Error("Failed to buy chips");

                const data = await res.json();
                if (onSuccess) onSuccess(data.newBalance); // ✅ Pass new balance
            }

            onClose();
        } catch (err) {
            console.error("Failed to buy chips:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/30" onClick={onClose} />
            <div className="bg-white rounded-2xl p-8 z-10 w-full max-w-md shadow-lg relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                    &times;
                </button>

                <h2 className="text-2xl font-light text-gray-800 mb-6">Buy Chips</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-3">Select Amount</label>
                        <div className="grid grid-cols-2 gap-3">
                            {chipOptions.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setAmount(option)}
                                    className={`py-3 px-4 rounded-lg border-2 transition-colors ${
                                        amount === option
                                            ? "border-[#ffb5c0] bg-[#ffb5c0]/10 text-[#ffb5c0]"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    {option} chips
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={handleBuy}
                        disabled={loading || amount <= 0}
                        className="w-full py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Buy
                    </button>
                </div>
            </div>
        </div>
    );
}
