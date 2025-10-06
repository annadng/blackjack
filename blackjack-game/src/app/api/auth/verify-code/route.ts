import { NextRequest, NextResponse } from "next/server";
import { dynamo } from "@/lib/dynamoClient";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

export async function POST(request: NextRequest) {
    try {
        const { email, code } = await request.json();

        if (!email || !code) {
            return NextResponse.json(
                { error: "Email and code are required", valid: false },
                { status: 400 }
            );
        }

        // Get user from DynamoDB
        const result = await dynamo.send(
            new GetCommand({
                TableName: process.env.DYNAMO_USERS_TABLE,
                Key: { username: email }
            })
        );

        if (!result.Item) {
            return NextResponse.json(
                { error: "User not found", valid: false },
                { status: 404 }
            );
        }

        const { verificationCode, codeExpiresAt } = result.Item;

        // Check if verification code exists
        if (!verificationCode) {
            return NextResponse.json(
                { error: "No verification code found", valid: false },
                { status: 404 }
            );
        }

        // Check if code expired
        if (Date.now() > codeExpiresAt) {
            // Remove expired code
            await dynamo.send(
                new UpdateCommand({
                    TableName: process.env.DYNAMO_USERS_TABLE,
                    Key: { username: email },
                    UpdateExpression: "REMOVE verificationCode, codeExpiresAt"
                })
            );

            return NextResponse.json(
                { error: "Verification code expired", valid: false },
                { status: 400 }
            );
        }

        // Check if code matches
        if (code !== verificationCode) {
            return NextResponse.json(
                { error: "Invalid verification code", valid: false },
                { status: 400 }
            );
        }

        // Code is valid - mark user as verified and remove code
        await dynamo.send(
            new UpdateCommand({
                TableName: process.env.DYNAMO_USERS_TABLE,
                Key: { username: email },
                UpdateExpression: "SET isVerified = :verified REMOVE verificationCode, codeExpiresAt",
                ExpressionAttributeValues: {
                    ":verified": true
                }
            })
        );

        return NextResponse.json({
            valid: true,
            userId: email,
            message: "Verification successful"
        });
    } catch (error) {
        console.error("Error verifying code:", error);
        return NextResponse.json(
            { error: "Failed to verify code", valid: false },
            { status: 500 }
        );
    }
}