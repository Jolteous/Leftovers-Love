'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function RecipeCardSkeleton() {
    return (
        <div className="flex space-x-4 p-4 border-b">
            <Skeleton className="w-24 h-24 rounded-md" />

            <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
            </div>
        </div>
    );
}
