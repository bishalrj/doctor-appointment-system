"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      title="Toggle dark mode"
      className="text-xs font-semibold tracking-wider px-2.5 py-1 h-7 border-border hover:bg-muted"
    >
      THEME
    </Button>
  );
}
