import { NextRequest, NextResponse } from "next/server";
import { dynamo } from "@/lib/dynamoClient";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { verifyPassword } from "@/lib/password";

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password are required" },
                { status: 400 }
            );
        }

        // Get user from database
        const result = await dynamo.send(
            new GetCommand({
                TableName: process.env.DYNAMO_USERS_TABLE,
                Key: { username }
            })
        );

        if (!result.Item) {
            return NextResponse.json(
                { error: "Invalid username or password" },
                { status: 401 }
            );
        }

        const user = result.Item;

        // Check if user signed up with Google
        if (user.authProvider === "google") {
            return NextResponse.json(
                { error: "Please sign in with Google" },
                { status: 401 }
            );
        }

        // Verify password
        if (!user.passwordHash || !user.passwordSalt) {
            return NextResponse.json(
                { error: "Invalid username or password" },
                { status: 401 }
            );
        }

        const isValid = verifyPassword(password, user.passwordHash, user.passwordSalt);

        if (!isValid) {
            return NextResponse.json(
                { error: "Invalid username or password" },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            user: {
                username: user.username,
                chips: user.chips
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Failed to login" },
            { status: 500 }
        );
    }
}
