import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { dynamo } from "@/lib/dynamoClient";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Username and Password",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) return null;

                try {
                    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            username: credentials.username,
                            password: credentials.password
                        })
                    });

                    const data = await response.json();

                    if (response.ok && data.user) {
                        return {
                            id: data.user.username,
                            email: data.user.username,
                            name: data.user.username
                        };
                    }

                    return null;
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60 // 30 days
    },
    callbacks: {
        async signIn({ user, account }) {
            // Handle Google sign in
            if (account?.provider === "google" && user.email) {
                try {
                    // Check if user exists
                    const result = await dynamo.send(
                        new GetCommand({
                            TableName: process.env.DYNAMO_USERS_TABLE,
                            Key: { username: user.email }
                        })
                    );

                    // Create user if doesn't exist
                    if (!result.Item) {
                        await dynamo.send(
                            new PutCommand({
                                TableName: process.env.DYNAMO_USERS_TABLE,
                                Item: {
                                    username: user.email,
                                    chips: 500,
                                    authProvider: "google",
                                    createdAt: Date.now()
                                }
                            })
                        );
                    }
                } catch (error) {
                    console.error("Error creating Google user:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.email = token.email as string;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login"
    }
});

export { handler as GET, handler as POST };
