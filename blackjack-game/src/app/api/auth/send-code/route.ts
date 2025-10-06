import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function POST(request: NextRequest) {
    try {
        const { email, code, token } = await request.json();

        if (!email || !code || !token) {
            return NextResponse.json(
                { error: "Email, code, and token are required", valid: false },
                { status: 400 }
            );
        }

        try {
            // Verify JWT token
            const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "your-secret-key");
            const { payload } = await jwtVerify(token, secret);

            // Check if email matches
            if (payload.email !== email) {
                return NextResponse.json(
                    { error: "Invalid token", valid: false },
                    { status: 400 }
                );
            }

            // Check if code matches
            if (payload.code !== code) {
                return NextResponse.json(
                    { error: "Invalid verification code", valid: false },
                    { status: 400 }
                );
            }

            // Token is valid and code matches
            return NextResponse.json({
                valid: true,
                userId: email,
                message: "Verification successful"
            });
        } catch (jwtError) {
            // JWT verification failed (expired or invalid)
            return NextResponse.json(
                { error: "Verification code expired or invalid", valid: false },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Error verifying code:", error);
        return NextResponse.json(
            { error: "Failed to verify code", valid: false },
            { status: 500 }
        );
    }
}