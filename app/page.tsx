'use client';

import Link from "next/link";
import { Button } from '@/components/ui/button';

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-r from-green-100 to-blue-100 flex flex-col items-center justify-center p-4">
            <h1 className="text-5xl font-extrabold text-gray-800 mb-4 text-center">
                Leftovers Love
            </h1>

            <p className="text-xl text-gray-600 mb-8 text-center">
                Minimize food loss by finding new recipes
            </p>

            <Link href="/auth">
                <Button variant="default" size="lg" className="px-8 py-4">
                    Sign In
                </Button>
            </Link>
        </div>
    );
}
