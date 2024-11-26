import bcrypt from "bcryptjs";
import {AuthOptions, Session, User} from "next-auth";
import {JWT} from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            id: "user-auth",
            name: "Credentials",
            credentials: {
                email: {label: "Email", type: "text"},
                password: {label: "Password", type: "password"},
            },
            async authorize(credentials) {
                const {email, password} = credentials as {
                    email: string;
                    password: string;
                };
                const user = await prisma.user.findUnique({
                    where: {
                        email: email,
                    },
                });

                if (!user || !user.password)
                    throw new Error("Incorrect Email/Password");

                const isValid = await bcrypt.compare(password, user.password);
                if (!isValid) throw new Error("Incorrect Email/Password");
                return {
                    id: String(user.id),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                }
            },
        })
    ],
    callbacks: {
        async jwt({token, user}: { token: JWT; user: User }) {
            if (user) {
                token.user = user;
            }
            return token;
        },
        async session({session, token}: { session: Session; token: JWT }) {
            if (token.user) {
                session.user = token.user;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth",
        signOut: "/auth",
    },
};