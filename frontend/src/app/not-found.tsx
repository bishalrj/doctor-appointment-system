import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="rounded border border-border bg-card px-4 py-2 font-mono text-xl font-bold text-muted-foreground mb-6">
        [ ERROR: 404 ]
      </div>
      <h1 className="font-hanken text-3xl font-bold tracking-tight text-foreground">Page Not Found</h1>
      <p className="mt-2 text-xs text-muted-foreground max-w-md">
        The clinical portal or record you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className="mt-8">
        <Button variant="medical" size="sm" className="text-xs font-bold uppercase tracking-wider shadow-none">
          RETURN HOME
        </Button>
      </Link>
    </div>
  );
}
