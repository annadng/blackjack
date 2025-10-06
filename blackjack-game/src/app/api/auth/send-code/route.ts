import { NextRequest, NextResponse } from "next/server";
import { dynamo } from "@/lib/dynamoClient";
import { PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
});

function generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || !email.includes("@")) {
            return NextResponse.json(
                { error: "Valid email is required" },
                { status: 400 }
            );
        }

        const code = generateCode();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Check if user exists
        const userResult = await dynamo.send(
            new GetCommand({
                TableName: process.env.DYNAMO_USERS_TABLE,
                Key: { username: email }
            })
        );

        const isNewUser = !userResult.Item;

        // Store verification code and expiry in the user record
        if (isNewUser) {
            // Create new user with verification code and 500 starting chips
            await dynamo.send(
                new PutCommand({
                    TableName: process.env.DYNAMO_USERS_TABLE,
                    Item: {
                        username: email,
                        chips: 500,
                        verificationCode: code,
                        codeExpiresAt: expiresAt,
                        isVerified: false,
                        createdAt: Date.now()
                    }
                })
            );
        } else {
            // Update existing user with new verification code
            await dynamo.send(
                new UpdateCommand({
                    TableName: process.env.DYNAMO_USERS_TABLE,
                    Key: { username: email },
                    UpdateExpression: "SET verificationCode = :code, codeExpiresAt = :expires",
                    ExpressionAttributeValues: {
                        ":code": code,
                        ":expires": expiresAt
                    }
                })
            );
        }

        // Send email via AWS SES
        const emailParams = {
            Source: process.env.SES_FROM_EMAIL!, // e.g., "noreply@yourdomain.com"
            Destination: {
                ToAddresses: [email]
            },
            Message: {
                Subject: {
                    Data: "Your Blackjack Verification Code",
                    Charset: "UTF-8"
                },
                Body: {
                    Html: {
                        Data: `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <meta charset="UTF-8">
                            </head>
                            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                                <div style="background: linear-gradient(135deg, #fccfcf 0%, #ffb5c0 100%); padding: 40px; border-radius: 12px; text-align: center;">
                                    <h1 style="color: white; margin: 0;">🎰 Blackjack</h1>
                                </div>
                                
                                <div style="background: white; padding: 40px; border-radius: 12px; margin-top: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                    ${isNewUser ? `
                                        <h2 style="color: #333; margin-top: 0;">Welcome to Blackjack! 🎉</h2>
                                        <p style="color: #666; font-size: 16px;">Your account has been created with <strong>500 chips</strong> to get you started.</p>
                                    ` : `
                                        <h2 style="color: #333; margin-top: 0;">Welcome Back! 👋</h2>
                                    `}
                                    
                                    <p style="color: #666; font-size: 16px;">Your verification code is:</p>
                                    
                                    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 30px 0;">
                                        <p style="font-size: 36px; font-weight: bold; color: #ff9fb0; margin: 0; letter-spacing: 8px; text-align: center;">${code}</p>
                                    </div>
                                    
                                    <p style="color: #999; font-size: 14px;">This code expires in 10 minutes.</p>
                                </div>
                                
                                <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
                                    If you didn't request this code, please ignore this email.
                                </p>
                            </body>
                            </html>
                        `,
                        Charset: "UTF-8"
                    },
                    Text: {
                        Data: `Your Blackjack verification code is: ${code}\n\n${isNewUser ? 'Welcome! Your account has been created with 500 chips.\n\n' : ''}This code expires in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
                        Charset: "UTF-8"
                    }
                }
            }
        };

        await sesClient.send(new SendEmailCommand(emailParams));

        return NextResponse.json({
            success: true,
            message: "Verification code sent to your email",
            isNewUser
        });
    } catch (error) {
        console.error("Error sending verification code:", error);
        return NextResponse.json(
            { error: "Failed to send verification code" },
            { status: 500 }
        );
    }
}