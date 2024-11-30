// /components/ProtectedPath.tsx

'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import {Spinner} from "@/components/Spinner";


export default function ProtectedPath({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/auth");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div
                className="flex items-center justify-center h-screen w-screen bg-gray-100 dark:bg-gray-900"
                role="status"
                aria-live="polite"
                aria-busy="true"
            >
                <Spinner size={4} />
                <span className="sr-only">Loading...</span>
            </div>
        );
    }

    return <>{session ? children : null}</>;
}
