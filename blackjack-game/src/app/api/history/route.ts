import { NextRequest, NextResponse } from "next/server";
import { dynamo } from "@/lib/dynamoClient";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get("username");
        const limit = parseInt(searchParams.get("limit") || "20");
        const lastKey = searchParams.get("lastKey");

        if (!username) {
            return NextResponse.json(
                { error: "Username is required" },
                { status: 400 }
            );
        }

        const queryParams: any = {
            TableName: process.env.GAME_HISTORY_TABLE || "BlackjackHistory",
            KeyConditionExpression: "username = :username",
            ExpressionAttributeValues: {
                ":username": username
            },
            ScanIndexForward: false, // Sort by timestamp descending (newest first)
            Limit: limit
        };

        // Add pagination token if provided
        if (lastKey) {
            queryParams.ExclusiveStartKey = JSON.parse(decodeURIComponent(lastKey));
        }

        const result = await dynamo.send(new QueryCommand(queryParams));

        return NextResponse.json({
            games: result.Items || [],
            count: result.Count || 0,
            lastKey: result.LastEvaluatedKey
                ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey))
                : null,
            hasMore: !!result.LastEvaluatedKey
        });
    } catch (error) {
        console.error("Error fetching game history:", error);
        return NextResponse.json(
            { error: "Failed to fetch game history" },
            { status: 500 }
        );
    }
}