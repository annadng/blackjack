import { NextResponse } from "next/server";
import { dynamo } from "@/lib/dynamoClient";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

export async function POST(req: Request) {
    try {
        const { username, amount } = await req.json();

        if (!username || !amount) {
            return NextResponse.json({ error: "Missing username or amount" }, { status: 400 });
        }

        // Increase chip balance
        const command = new UpdateCommand({
            TableName: process.env.DYNAMO_USERS_TABLE!, // e.g. BlackjackUsers
            Key: { username },
            UpdateExpression: "SET chips = if_not_exists(chips, :zero) + :amount",
            ExpressionAttributeValues: {
                ":amount": amount,
                ":zero": 0,
            },
            ReturnValues: "UPDATED_NEW",
        });

        const result = await dynamo.send(command);

        return NextResponse.json({
            success: true,
            newBalance: result.Attributes?.chips,
        });
    } catch (err) {
        console.error("Error adding chips:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}