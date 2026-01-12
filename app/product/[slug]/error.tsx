"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({ reset }: { error: Error, reset: () => void }) {
    return (
        <main className="container mx-auto flex flex-col items-center justify-center h-screen gap-4">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">Please try again later</p>
            <Button onClick={() => reset()}>Try again</Button>
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
                Go back to Home
            </Link>
        </main>
    )
}