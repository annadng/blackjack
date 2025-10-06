import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            id: "email-verification",
            name: "Email Verification",
            credentials: {
                email: { label: "Email", type: "email" },
                code: { label: "Verification Code", type: "text" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.code) return null;

                try {
                    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/verify-code`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: credentials.email, code: credentials.code })
                    });

                    const data = await response.json();

                    if (response.ok && data.valid) {
                        return {
                            id: data.userId || credentials.email,
                            email: credentials.email,
                            name: credentials.email.split("@")[0]
                        };
                    }

                    return null;
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60 // 30 days
    },
    callbacks: {
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
    }
});

export { handler as GET, handler as POST };
