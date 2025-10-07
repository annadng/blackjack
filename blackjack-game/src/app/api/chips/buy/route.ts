import { NextRequest, NextResponse } from "next/server";
import { dynamo } from "@/lib/dynamoClient";
import { UpdateCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

export async function POST(request: NextRequest) {
    try {
        const { username, amount } = await request.json();

        if (!username || !amount || amount <= 0) {
            return NextResponse.json(
                { error: "Invalid username or amount" },
                { status: 400 }
            );
        }

        // Check if user exists
        const userResult = await dynamo.send(
            new GetCommand({
                TableName: process.env.DYNAMO_USERS_TABLE,
                Key: { username }
            })
        );

        if (!userResult.Item) {
            // Create new user with the purchased chips
            await dynamo.send(
                new PutCommand({
                    TableName: process.env.DYNAMO_USERS_TABLE,
                    Item: {
                        username,
                        chips: amount,
                        createdAt: Date.now()
                    }
                })
            );

            return NextResponse.json({
                success: true,
                newBalance: amount
            });
        }

        // Add chips to existing user
        const result = await dynamo.send(
            new UpdateCommand({
                TableName: process.env.DYNAMO_USERS_TABLE,
                Key: { username },
                UpdateExpression: "SET chips = chips + :amount",
                ExpressionAttributeValues: {
                    ":amount": amount
                },
                ReturnValues: "ALL_NEW"
            })
        );

        return NextResponse.json({
            success: true,
            newBalance: result.Attributes?.chips || 0
        });
    } catch (error) {
        console.error("Error adding chips:", error);
        return NextResponse.json(
            { error: "Failed to add chips" },
            { status: 500 }
        );
    }
}