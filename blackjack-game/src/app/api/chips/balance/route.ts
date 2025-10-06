import { NextResponse } from "next/server";
import { dynamo } from "@/lib/dynamoClient";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
        return NextResponse.json({ error: "Missing username" }, { status: 400 });
    }

    const getCommand = new GetCommand({
        TableName: process.env.DYNAMO_USERS_TABLE!,
        Key: { username: String(username) }
    });

    try {
        const user = await dynamo.send(getCommand);
        

        // If user does not exist yet, create with 500 chips for guests
        if (!user.Item) {
            const initialChips = username.startsWith("guest-") ? 500 : 0;

            await dynamo.send(
                new PutCommand({
                    TableName: process.env.DYNAMO_USERS_TABLE!,
                    Item: { username: username.toString(), chips: initialChips }
                })
            );

            return NextResponse.json({ chips: initialChips });
        }

        return NextResponse.json({ chips: user.Item.chips || 0 });
    } catch (err) {
        console.error("Error fetching user chips:", err);
        return NextResponse.json(
            { error: "Failed to fetch user chips" },
            { status: 500 }
        );
    }
}
