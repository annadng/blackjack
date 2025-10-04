import { NextResponse } from "next/server";
import { dynamo } from "@/lib/dynamoClient";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: "Missing username or password" }, { status: 400 });
        }

        // Check if user exists
        const existingUser = await dynamo.send(new GetCommand({
            TableName: process.env.DYNAMO_USERS_TABLE!,
            Key: { username },
        }));

        if (existingUser.Item) {
            return NextResponse.json({ error: "Username already exists" }, { status: 409 });
        }

        // Create user with 500 chips
        await dynamo.send(new PutCommand({
            TableName: process.env.DYNAMO_USERS_TABLE!,
            Item: {
                username,
                password,
                chips: 500,
                createdAt: new Date().toISOString(),
            },
        }));

        return NextResponse.json({ success: true, chips: 500 });
    } catch (err) {
        console.error("Signup error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

