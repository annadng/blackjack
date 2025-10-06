import { NextRequest, NextResponse } from "next/server";
import { dynamo } from "@/lib/dynamoClient";
import { GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

export async function POST(request: NextRequest) {
    try {
        const { email, code } = await request.json();

        if (!email || !code) {
            return NextResponse.json({ error: "Email and code are required", valid: false }, { status: 400 });
        }

        const result = await dynamo.send(
            new GetCommand({
                TableName: process.env.DYNAMODB_TABLE_NAME || "blackjack-verification",
                Key: { email }
            })
        );

        if (!result.Item) return NextResponse.json({ error: "No verification code found", valid: false }, { status: 404 });

        const { code: storedCode, expiresAt } = result.Item;

        if (Date.now() > expiresAt) {
            await dynamo.send(
                new DeleteCommand({
                    TableName: process.env.DYNAMODB_TABLE_NAME || "blackjack-verification",
                    Key: { email }
                })
            );
            return NextResponse.json({ error: "Verification code expired", valid: false }, { status: 400 });
        }

        if (code !== storedCode) return NextResponse.json({ error: "Invalid verification code", valid: false }, { status: 400 });

        await dynamo.send(
            new DeleteCommand({
                TableName: process.env.DYNAMODB_TABLE_NAME || "blackjack-verification",
                Key: { email }
            })
        );

        return NextResponse.json({ valid: true, userId: email, message: "Verification successful" });
    } catch (error) {
        console.error("Error verifying code:", error);
        return NextResponse.json({ error: "Failed to verify code", valid: false }, { status: 500 });
    }
}
