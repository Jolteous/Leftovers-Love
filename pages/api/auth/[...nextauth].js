import bcrypt from "bcrypt";
import NextAuth, { Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import  prisma  from "../../../lib/prisma";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                const { email, password } = credentials;
                const user = await prisma.user.findUnique({
                    where: {
                        email: email,
                    },
                });

                if (user == null || user.password == null)
                    throw new Error("Incorrect Email/Password");

                const isValid = await bcrypt.compare(password, user.password);
                if (!isValid) throw new Error("Incorrect Email/Password");
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
        }),
    ],
    // https://stackoverflow.com/questions/73553412/nextauthjs-custom-user-model
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                return {
                    ...token,
                    user: user,
                };
            }
            return token;
        },
        async session({ session, token }) {
            if (token.user) {
                session.user = token.user;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login"
    }
};

export default NextAuth(authOptions);