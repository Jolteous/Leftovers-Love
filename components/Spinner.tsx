'use client';

import React from 'react';

interface SpinnerProps {
    size?: number;
}

export const Spinner: React.FC<SpinnerProps> = ({ size  }) => {
    return (
        <div
            className="flex space-x-1"
            role="status"
            aria-label="Loading"
        >
            <span
                className={`inline-block w-${size} h-${size} bg-current rounded-full animate-bounce`}
                style={{ animationDelay: '0s' }}
            ></span>
            <span
                className={`inline-block w-${size} h-${size} bg-current rounded-full animate-bounce`}
                style={{ animationDelay: '0.2s' }}
            ></span>
            <span
                className={`inline-block w-${size} h-${size} bg-current rounded-full animate-bounce`}
                style={{ animationDelay: '0.4s' }}
            ></span>
        </div>
    );
};
