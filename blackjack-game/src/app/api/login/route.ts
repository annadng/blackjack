import { NextResponse } from "next/server";
import { dynamo } from "@/lib/dynamoClient";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: "Missing username or password" }, { status: 400 });
        }

        // Fetch user
        const user = await dynamo.send(new GetCommand({
            TableName: process.env.DYNAMO_USERS_TABLE!,
            Key: { username },
        }));

        if (!user.Item || user.Item.password !== password) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        return NextResponse.json({ success: true, chips: user.Item.chips });
    } catch (err) {
        console.error("Login error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
