import { NextResponse } from "next/server";
import { dynamo } from "@/lib/dynamoClient";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { getServerSession } from "next-auth";

export async function GET() {
    try {
        const session = await getServerSession();
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.email;

        // DynamoDB Query on partition key (userId), sorted by playedAt
        const command = new QueryCommand({
            TableName: process.env.DYNAMO_HISTORY_TABLE!,
            KeyConditionExpression: "userId = :uid",
            ExpressionAttributeValues: {
                ":uid": userId,
            },
            ScanIndexForward: false
        });

        const result = await dynamo.send(command);

        return NextResponse.json(result.Items || []);
    } catch (err) {
        console.error("Error fetching history:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
