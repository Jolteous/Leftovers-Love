'use client';

import React, { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { z } from 'zod';
import bcrypt from "bcryptjs";

const signUpSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    name: z.string().min(2, 'Name must be at least 2 characters long'),
});

async function signUp(email: string, password: string, name: string) {
    const response = await fetch('/api/auth/signUp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to sign up');
    }

    return response.ok;
}

export default function Auth() {
    const router = useRouter();
    const { toast } = useToast();

    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [activeTab, setActiveTab] = useState<'signIn' | 'signUp'>('signIn');
    const { status } = useSession();

    useEffect(() => {
        if (status === 'authenticated') router.push('/');
    }, [status]);

    const handleSignIn = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsAuthenticating(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email');
        const password = formData.get('password');

        signIn('user-auth', {
            redirect: false,
            email,
            password,
        }).then((resp) => {
            if (resp?.error) {
                toast({
                    title: 'Login Failed',
                    description: resp.error,
                    variant: 'destructive',
                });
                setIsAuthenticating(false);
                console.error(resp.error);
            } else {
                toast({
                    title: 'Success',
                    description: 'Logged in successfully. Redirecting...',
                });
            }
        });
    };

    const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsAuthenticating(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const name = formData.get('name') as string;

        try {
            signUpSchema.parse({ email, password, name });

            const hashedPassword = bcrypt.hash(password, 10);

            await signUp(email, await hashedPassword, name);

            toast({
                title: 'Success',
                description: 'Account created successfully.',
            });
            setIsAuthenticating(false);
        } catch (error: any) {
            if (error.name === 'ZodError') {
                toast({
                    title: 'Validation Error',
                    description: error.errors.map((err: any) => err.message).join(', '),
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Signup Failed',
                    description: error.message,
                    variant: 'destructive',
                });
            }
            setIsAuthenticating(false);
            console.error(error);
        }

        signIn('user-auth', {
            redirect: false,
            email,
            password,
        }).then((resp) => {
            if (resp?.error) {
                toast({
                    title: 'Login Failed',
                    description: resp.error,
                    variant: 'destructive',
                });
                setIsAuthenticating(false);
                console.error(resp.error);
            } else {
                toast({
                    title: 'Success',
                    description: 'Logged in successfully. Redirecting...',
                });
            }
        });
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-50 p-6">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-extrabold text-gray-800">Leftovers Love</h2>
                    <p className="mt-2 text-gray-600">
                        {activeTab === 'signIn'
                            ? 'Sign in to your account'
                            : 'Create a new account'}
                    </p>
                </div>

                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        onClick={() => setActiveTab('signIn')}
                        className={`w-1/2 py-2 text-center font-medium ${
                            activeTab === 'signIn'
                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                : 'text-gray-600'
                        }`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setActiveTab('signUp')}
                        className={`w-1/2 py-2 text-center font-medium ${
                            activeTab === 'signUp'
                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                : 'text-gray-600'
                        }`}
                    >
                        Sign Up
                    </button>
                </div>

                {activeTab === 'signIn' ? (
                    <form className="space-y-6" onSubmit={handleSignIn}>
                        <div>
                            <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="Enter your email"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                placeholder="Enter your password"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <Button
                                type="submit"
                                disabled={isAuthenticating}
                                className="w-full py-2 px-4 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-lg transition ease-in-out duration-150"
                            >
                                {isAuthenticating ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <form className="space-y-6" onSubmit={handleSignUp}>
                        <div>
                            <Label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Full Name
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                placeholder="Enter your full name"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="Enter your email"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                placeholder="Create a password"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <Button
                                type="submit"
                                disabled={isAuthenticating}
                                className="w-full py-2 px-4 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-lg transition ease-in-out duration-150"
                            >
                                {isAuthenticating ? 'Creating account...' : 'Sign up'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </main>
    );
}