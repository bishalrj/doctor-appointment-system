import React from "react";
import { Spinner, Skeleton } from "@/components/ui/loader";

export default function GlobalLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-6 space-y-6">
      <div className="flex flex-col items-center space-y-3 text-center">
        <Spinner size={40} className="text-primary" />
        <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase animate-pulse">
          Loading MediCare Plus Portal...
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          Please wait while we securely fetch your medical records and scheduling directory.
        </p>
      </div>

      <div className="w-full max-w-2xl space-y-3 pt-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  );
}
