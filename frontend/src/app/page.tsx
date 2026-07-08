"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 bg-background border-b border-border/60">
          <div className="container px-4 md:px-8 mx-auto">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h1 className="font-hanken text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
                Modern Healthcare Scheduling & <span className="text-primary underline decoration-primary/30 decoration-wavy">Doctor Discovery</span>
              </h1>

              <p className="text-base md:text-lg text-muted-foreground font-normal leading-relaxed max-w-2xl mx-auto">
                Production-ready medical platform built with clean architecture, role-based access control, and stateless JWT authentication. Engineered for security, speed, and reliability.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button variant="medical" size="md" className="w-full font-bold uppercase tracking-wider text-xs shadow-none">
                    REGISTER AS PATIENT OR DOCTOR
                  </Button>
                </Link>
                <Link href="/doctors" className="w-full sm:w-auto">
                  <Button variant="secondary" size="md" className="w-full font-bold uppercase tracking-wider text-xs shadow-none border border-border">
                    BROWSE DOCTORS
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button variant="outline" size="md" className="w-full font-bold uppercase tracking-wider text-xs shadow-none">
                    SIGN IN TO PORTAL
                  </Button>
                </Link>
              </div>

              <div className="pt-8 flex flex-wrap items-center justify-center gap-6 font-mono text-xs text-muted-foreground uppercase tracking-wider border-t border-border/40 max-w-xl mx-auto">
                <div>[ BCRYPT HASHING ]</div>
                <div>[ TANSTACK QUERY V5 ]</div>
                <div>[ FASTAPI & SQLALCHEMY 2 ]</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-16 bg-muted/10 border-b border-border/60">
          <div className="container px-4 md:px-8 mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <h2 className="font-hanken text-2xl font-bold tracking-tight text-foreground">Built for Scale & Security</h2>
              <p className="text-xs text-muted-foreground">Every component is crafted following strict SOLID principles and production-grade engineering practices.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border border-border rounded-sm shadow-none bg-card hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="rounded-sm border border-border bg-muted/30 px-2 py-0.5 font-mono text-[10px] font-bold text-muted-foreground w-fit mb-2">
                    [ SECURITY ]
                  </div>
                  <CardTitle className="font-hanken text-lg font-bold">Role-Based Access Control</CardTitle>
                  <CardDescription className="text-xs">Strict isolation between Patient, Doctor, and Admin workspaces.</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Custom dependency injection in FastAPI validates JWT claims and enforces role permissions before executing business logic.
                </CardContent>
              </Card>

              <Card className="border border-border rounded-sm shadow-none bg-card hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="rounded-sm border border-border bg-muted/30 px-2 py-0.5 font-mono text-[10px] font-bold text-muted-foreground w-fit mb-2">
                    [ AUTHENTICATION ]
                  </div>
                  <CardTitle className="font-hanken text-lg font-bold">Stateless JWT Rotation</CardTitle>
                  <CardDescription className="text-xs">Secure access and refresh token rotation with expiration limits.</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Axios interceptors automatically detect 401 Unauthorized responses and refresh session tokens seamlessly without user interruption.
                </CardContent>
              </Card>

              <Card className="border border-border rounded-sm shadow-none bg-card hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="rounded-sm border border-border bg-muted/30 px-2 py-0.5 font-mono text-[10px] font-bold text-muted-foreground w-fit mb-2">
                    [ ARCHITECTURE ]
                  </div>
                  <CardTitle className="font-hanken text-lg font-bold">Clean Architecture</CardTitle>
                  <CardDescription className="text-xs">Foundation scaffolded for scheduling, prescriptions, and billing.</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Database entities feature UUID primary keys, soft delete support, and automatic timestamp triggers prepared for complex relationships.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
