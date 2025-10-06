"use client";

interface InsufficientChipsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBuyChips: () => void;
    requiredAmount: number;
    currentChips: number;
}

export default function InsufficientChipsModal({
    isOpen,
    onClose,
    onBuyChips,
    requiredAmount,
    currentChips
}: InsufficientChipsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fadeIn">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Insufficient Chips
                    </h2>
                    <p className="text-gray-600">
                        You need <span className="font-semibold text-pink-600">${requiredAmount}</span> to place this bet, but you only have <span className="font-semibold">${currentChips}</span>.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => {
                            onClose();
                            onBuyChips();
                        }}
                        className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-full font-semibold shadow-lg transition-all"
                    >
                        Buy More Chips
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}