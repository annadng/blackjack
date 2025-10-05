import { NextResponse } from "next/server";
import { dynamo } from "@/lib/dynamoClient";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) return NextResponse.json({ error: "Missing username" }, { status: 400 });

    const command = new GetCommand({
        TableName: process.env.DYNAMO_USERS_TABLE!,
        Key: { username },
    });

    try {
        const user = await dynamo.send(command);
        return NextResponse.json({ chips: user.Item?.chips || 0 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }
}
