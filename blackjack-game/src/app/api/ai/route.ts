import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { playerHand, dealerCard } = await req.json();

        if (!playerHand || !dealerCard) {
            return NextResponse.json({ error: "Missing hand data" }, { status: 400 });
        }

        const prompt = `You are a blackjack strategy assistant following basic blackjack strategy.
The player's hand is: ${playerHand.join(", ")}
The dealer's visible card is: ${dealerCard}

Based on basic blackjack strategy, should the player Hit or Stand?
Respond with ONLY the word "hit" or "stand" (lowercase, no punctuation or explanation).`;
        
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }],
                        },
                    ],
                }),
            }
        );

        if (!response.ok) {
            console.error("Gemini API error:", await response.text());
            return NextResponse.json({ error: "AI service error" }, { status: 500 });
        }

        const data = await response.json();
        console.log("Gemini response:", JSON.stringify(data, null, 2));

        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!rawText) {
            console.error("No text in response");
            return NextResponse.json({ recommendation: "stand" });
        }

        // Extract hit or stand from the response
        const normalized = rawText.toLowerCase();
        let recommendation = "stand"; // default

        if (normalized.includes("hit")) {
            recommendation = "hit";
        } else if (normalized.includes("stand")) {
            recommendation = "stand";
        }
        
        return NextResponse.json({ recommendation });
    } catch (err) {
        console.error("Gemini AI error:", err);
        return NextResponse.json({ recommendation: "stand" }, { status: 200 });
    }
}
