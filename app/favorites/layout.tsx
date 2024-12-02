'use client';

import React from "react";
import {SessionProvider} from "next-auth/react";
import ProtectedPath from "@/components/auth/ProtectedPath";
import NavBar from "@/components/NavBar";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <ProtectedPath>
          <div className={"flex flex-col h-screen w-full"}>
              <NavBar/>
              <div className="flex-1 overflow-hidden">
                  {children}
              </div>
          </div>
      </ProtectedPath>
    </SessionProvider>
);
}
