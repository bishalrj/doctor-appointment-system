"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="rounded border border-destructive/20 bg-destructive/5 px-4 py-2 font-mono text-xl font-bold text-destructive mb-6">
        [ EXCEPTION: 500 ]
      </div>
      <h1 className="font-hanken text-2xl font-bold tracking-tight text-foreground">System Exception</h1>
      <p className="mt-2 text-xs text-muted-foreground max-w-md">
        An unexpected error occurred in our clinical application layer.
      </p>
      <div className="mt-6 p-3 rounded bg-card border border-border font-mono text-xs text-destructive max-w-lg overflow-auto">
        {error.message || "Unknown runtime exception"}
      </div>
      <div className="mt-8 flex items-center gap-4">
        <Button onClick={() => reset()} variant="outline" size="sm" className="text-xs font-bold uppercase tracking-wider">
          TRY AGAIN
        </Button>
        <Link href="/">
          <Button variant="medical" size="sm" className="text-xs font-bold uppercase tracking-wider shadow-none">
            RETURN HOME
          </Button>
        </Link>
      </div>
    </div>
  );
}
