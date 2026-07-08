"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const getDashboardUrl = () => {
    if (!user) return "/login";
    if (user.role === "ADMIN") return "/dashboard/admin";
    if (user.role === "DOCTOR") return "/dashboard/doctor";
    return "/dashboard/patient";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2 font-hanken text-xl font-bold tracking-tight text-foreground">
          <span>MEDICARE<span className="text-primary font-extrabold">PLUS</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <Link href="/doctors" className="hover:text-primary transition-colors">Find a Doctor</Link>
          <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link href={getDashboardUrl()}>
                <Button variant="outline" size="sm" className="gap-2 border-border text-xs font-bold uppercase tracking-wider text-primary hover:bg-muted shadow-none rounded-sm">
                  <span className="font-mono font-bold">[ PORTAL ]</span>
                </Button>
              </Link>
              <div className="hidden lg:flex flex-col text-right text-xs">
                <span className="font-semibold text-foreground">
                  {user.patient_profile?.first_name || user.doctor_profile?.first_name || "Admin"}
                </span>
                <span className="text-muted-foreground uppercase font-mono text-[10px] tracking-wider font-bold text-primary">
                  {user.role}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                title="Log out"
                className="text-xs font-bold font-mono text-muted-foreground hover:text-destructive gap-1 shadow-none rounded-sm"
              >
                [ LOGOUT ]
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-wider rounded-sm shadow-none">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button variant="medical" size="sm" className="text-xs font-bold uppercase tracking-wider shadow-none rounded-sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
