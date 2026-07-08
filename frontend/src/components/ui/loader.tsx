import * as React from "react";
import { cn } from "@/lib/utils";

export const Spinner: React.FC<{ className?: string; size?: number }> = ({
  className,
  size = 24,
}) => {
  return (
    <div className="flex items-center justify-center p-4">
      <div
        style={{ width: size, height: size }}
        className={cn(
          "animate-spin rounded-full border-2 border-primary border-t-transparent",
          className
        )}
      />
    </div>
  );
};

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/60", className)}
      {...props}
    />
  );
};
