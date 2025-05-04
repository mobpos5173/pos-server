"use client";

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export function AuthCheck({ children }: { children: React.ReactNode }) {
    const { userId } = useAuth();

    if (!userId) {
        redirect("/sign-in");
    }

    return <>{children}</>;
}
