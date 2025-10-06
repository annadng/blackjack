"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [step, setStep] = useState<"email" | "code">("email");
    const [verificationCode, setVerificationCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/auth/send-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setStep("code");
            } else {
                setError(data.error || "Failed to send verification code");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("email-verification", {
                email,
                code: verificationCode,
                redirect: false
            });

            if (result?.ok) {
                router.push("/");
            } else {
                setError("Invalid verification code");
            }
        } catch (err) {
            setError("Verification failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#fccfcf] to-[#ffb5c0] flex items-center justify-center px-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-12 shadow-lg max-w-md w-full">
                <h1 className="text-3xl font-light text-gray-800 mb-2 text-center">
                    Welcome to Blackjack
                </h1>
                <p className="text-sm text-gray-400 text-center mb-8">
                    {step === "email" ? "Enter your email to get started" : "Enter the code sent to your email"}
                </p>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {step === "email" ? (
                    <form onSubmit={handleSendCode} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm text-gray-600 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#ffb5c0] transition-colors"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#ffb5c0] text-white py-3 rounded-lg font-medium hover:bg-[#ff9fb0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Sending..." : "Send Verification Code"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyCode} className="space-y-6">
                        <div>
                            <label htmlFor="code" className="block text-sm text-gray-600 mb-2">
                                Verification Code
                            </label>
                            <input
                                type="text"
                                id="code"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#ffb5c0] transition-colors text-center text-2xl tracking-widest"
                                placeholder="000000"
                                maxLength={6}
                                required
                            />
                            <p className="text-xs text-gray-400 mt-2 text-center">
                                Sent to {email}
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#ffb5c0] text-white py-3 rounded-lg font-medium hover:bg-[#ff9fb0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Verifying..." : "Verify & Login"}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setStep("email");
                                setVerificationCode("");
                                setError("");
                            }}
                            className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            ← Back to email
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center">
                    <button
                        onClick={() => router.push("/")}
                        className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        Continue as Guest
                    </button>
                </div>
            </div>
        </div>
    );
}