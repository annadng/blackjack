import { NextRequest, NextResponse } from "next/server";
import { dynamo } from "@/lib/dynamoClient";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { hashPassword } from "@/lib/password";

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        // Validate input
        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password are required" },
                { status: 400 }
            );
        }

        if (username.length < 3) {
            return NextResponse.json(
                { error: "Username must be at least 3 characters" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        // Check if username already exists
        const existingUser = await dynamo.send(
            new GetCommand({
                TableName: process.env.DYNAMO_USERS_TABLE,
                Key: { username }
            })
        );

        if (existingUser.Item) {
            return NextResponse.json(
                { error: "Username already exists" },
                { status: 409 }
            );
        }

        // Hash password
        const { hash, salt } = hashPassword(password);

        // Create user
        await dynamo.send(
            new PutCommand({
                TableName: process.env.DYNAMO_USERS_TABLE,
                Item: {
                    username,
                    passwordHash: hash,
                    passwordSalt: salt,
                    chips: 500,
                    authProvider: "credentials",
                    createdAt: Date.now()
                }
            })
        );

        return NextResponse.json({
            success: true,
            message: "Account created successfully"
        });
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { error: "Failed to create account" },
            { status: 500 }
        );
    }
}
