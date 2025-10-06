// src/app/api/game/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dynamo } from "@/lib/dynamoClient";
import { QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get("username");
        const limit = parseInt(searchParams.get("limit") || "10");
        const lastKey = searchParams.get("lastKey");

        if (!username) {
            return NextResponse.json(
                { error: "Username is required" },
                { status: 400 }
            );
        }

        const queryParams: any = {
            TableName: process.env.DYNAMO_HISTORY_TABLE!,
            KeyConditionExpression: "username = :username",
            ExpressionAttributeValues: {
                ":username": username
            },
            ScanIndexForward: false, // newest first
            Limit: limit
        };

        if (lastKey) {
            queryParams.ExclusiveStartKey = JSON.parse(lastKey);
        }

        const result = await dynamo.send(new QueryCommand(queryParams));

        // If no history exists yet, optionally create a dummy entry
        if (!result.Items || result.Items.length === 0) {
            // Optional: create an initial "empty history" row for the user
            const initialItem = {
                id: `${username}-init-${Date.now()}`,
                username,
                timestamp: Date.now(),
                bet: 0,
                playerCards: [],
                dealerCards: [],
                playerTotal: 0,
                dealerTotal: 0,
                result: "init",
                winnings: 0
            };

            await dynamo.send(
                new PutCommand({
                    TableName: process.env.DYNAMO_HISTORY_TABLE!,
                    Item: initialItem
                })
            );

            return NextResponse.json({
                games: [initialItem],
                lastKey: null,
                hasMore: false,
                count: 1
            });
        }

        return NextResponse.json({
            games: result.Items,
            lastKey: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : null,
            hasMore: !!result.LastEvaluatedKey,
            count: result.Count || result.Items.length
        });
    } catch (error: any) {
        console.error("Error fetching game history:", error);
        return NextResponse.json(
            { error: "Failed to fetch game history", details: error.message },
            { status: 500 }
        );
    }
}
