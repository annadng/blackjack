import { NextRequest, NextResponse } from "next/server";
import { dynamo } from "@/lib/dynamoClient";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

export async function POST(request: NextRequest) {
    try {
        const { username, amount } = await request.json();

        if (!username || !amount || amount <= 0) {
            return NextResponse.json(
                { error: "Invalid username or amount" },
                { status: 400 }
            );
        }

        // Deduct chips with condition check
        const result = await dynamo.send(
            new UpdateCommand({
                TableName: process.env.DYNAMO_USERS_TABLE,
                Key: { username },
                UpdateExpression: "SET chips = chips - :amount",
                ConditionExpression: "attribute_exists(chips) AND chips >= :amount",
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
    } catch (error: any) {
        // ConditionalCheckFailedException means insufficient chips
        if (error.name === "ConditionalCheckFailedException") {
            return NextResponse.json(
                { error: "Insufficient chips" },
                { status: 400 }
            );
        }

        console.error("Error deducting chips:", error);
        return NextResponse.json(
            { error: "Failed to deduct chips" },
            { status: 500 }
        );
    }
}