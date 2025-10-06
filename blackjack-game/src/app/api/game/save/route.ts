import { NextRequest, NextResponse } from "next/server";
import { dynamo } from "@/lib/dynamoClient";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import type {GameHistory} from "@/types";

export async function POST(request: NextRequest) {
    try {
        const gameData: Omit<GameHistory, "id" | "timestamp"> = await request.json();

        if (!gameData.username) {
            return NextResponse.json(
                { error: "Username is required" },
                { status: 400 }
            );
        }

        const gameHistory: GameHistory = {
            id: `${gameData.username}-${Date.now()}`,
            timestamp: Date.now(),
            ...gameData
        };

        await dynamo.send(
            new PutCommand({
                TableName: process.env.DYNAMO_HISTORY_TABLE,
                Item: gameHistory
            })
        );

        return NextResponse.json({
            success: true,
            gameId: gameHistory.id
        });
    } catch (error) {
        console.error("Error saving game history:", error);
        return NextResponse.json(
            { error: "Failed to save game history" },
            { status: 500 }
        );
    }
}