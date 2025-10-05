import { NextRequest, NextResponse } from "next/server";
import { dynamo } from "@/lib/dynamoClient";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

export async function POST(request: NextRequest) {
    try {
        const { username, amount, type } = await request.json();

        if (!username || amount === undefined) {
            return NextResponse.json(
                { error: "Username and amount required" },
                { status: 400 }
            );
        }

        let updateExpression: string;
        let conditionExpression: string | undefined;

        if (type === "deduct") {
            // Deduct chips when placing bet
            updateExpression = "SET chips = chips - :amount";
            conditionExpression = "chips >= :amount";
        } else if (type === "add") {
            // Add chips when winning
            updateExpression = "SET chips = chips + :amount";
        } else {
            return NextResponse.json(
                { error: "Invalid transaction type" },
                { status: 400 }
            );
        }

        const result = await dynamo.send(
            new UpdateCommand({
                TableName: process.env.DYNAMO_USERS_TABLE,
                Key: { username },
                UpdateExpression: updateExpression,
                ConditionExpression: conditionExpression,
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
        if (error.name === "ConditionalCheckFailedException") {
            return NextResponse.json(
                { error: "Insufficient chips" },
                { status: 400 }
            );
        }
        console.error("Chip transaction error:", error);
        return NextResponse.json(
            { error: "Failed to process transaction" },
            { status: 500 }
        );
    }
}