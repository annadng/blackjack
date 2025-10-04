import { NextResponse } from "next/server";
import {dynamo} from "@/lib/dynamoClient";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

// POST request to save a game result
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { playerId, result, chips } = body;

        if (!playerId || !result || chips === undefined) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const command = new PutCommand({
            TableName: process.env.DYNAMO_TABLE_NAME!,
            Item: {
                playerId,                  // partition key
                gameId: Date.now().toString(), // sort key (unique per game)
                result,                   
                chips,                     // new chip balance
                playedAt: new Date().toISOString(),
            },
        });

        await dynamo.send(command);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Error saving game:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
