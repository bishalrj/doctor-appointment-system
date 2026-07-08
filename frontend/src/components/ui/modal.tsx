"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={cn(
          "relative w-full max-w-lg rounded-xl bg-card p-6 shadow-2xl border border-border animate-in zoom-in-95 duration-200",
          className
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b">
          <div>
            {title && <h2 className="text-xl font-semibold text-foreground">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded px-2 py-1 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            [CLOSE]
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};
