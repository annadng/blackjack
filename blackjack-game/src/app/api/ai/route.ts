import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { playerHand, dealerCard } = await req.json();

        if (!playerHand || !dealerCard) {
            return NextResponse.json({ error: "Missing hand data" }, { status: 400 });
        }

        const prompt = `You are a blackjack assistant.
      The player's hand is ${playerHand.join(", ")} 
      and the dealer's visible card is ${dealerCard}.
      Recommend the optimal move: Hit or Stand.
      Respond with only "Hit" or "Stand".`;

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": process.env.GEMINI_API_KEY!,
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

        const data = await response.json();

        const recommendation =
            data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Unknown";

        return NextResponse.json({ recommendation });
    } catch (err) {
        console.error("Gemini AI error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
