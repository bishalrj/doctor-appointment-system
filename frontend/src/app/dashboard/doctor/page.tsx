"use client";

import React from "react";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const profile = user?.doctor_profile;

  return (
    <ProtectedRoute allowedRoles={["DOCTOR"]}>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Welcome Banner */}
        <div className="rounded-sm border border-border bg-card p-6 md:p-8 text-card-foreground shadow-none flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-sm bg-primary/10 px-3 py-1 text-xs font-mono font-bold text-primary border border-primary/20 uppercase tracking-wider">
              <span>[ DOCTOR CONSOLE • {profile?.specialization || "SPECIALIST"} ]</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight font-hanken">
              Dr. {profile?.first_name?.replace(/^Dr\.\s*|^Dr\s+/i, "")} {profile?.last_name}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl font-mono">
              Qualification: {profile?.qualification} • License: <span className="font-mono bg-muted px-2 py-0.5 rounded-sm border border-border text-foreground font-bold">{profile?.license_number}</span>
            </p>
          </div>

          <div className="shrink-0">
            {profile?.is_verified ? (
              <div className="flex items-center gap-2 rounded-sm bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 text-emerald-600 font-mono font-bold text-xs uppercase tracking-wider">
                [ VERIFIED PRACTITIONER ]
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-sm bg-amber-500/10 border border-amber-500/30 px-4 py-2 text-amber-600 font-mono font-bold text-xs uppercase tracking-wider">
                [ VERIFICATION PENDING ]
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-sm border border-border shadow-none bg-card hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardDescription className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Consultation Fee
              </CardDescription>
              <div className="rounded-sm border border-blue-500/20 bg-blue-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-blue-600">
                [ FEE ]
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-hanken text-3xl font-extrabold text-foreground">₹{profile?.consultation_fee !== undefined ? Number(profile.consultation_fee).toLocaleString("en-IN") : "0"}</div>
              <div className="text-xs text-muted-foreground font-mono mt-2">
                Standard appointment charge
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-sm border border-border shadow-none bg-card hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardDescription className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Experience
              </CardDescription>
              <div className="rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-600">
                [ EXP ]
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-hanken text-3xl font-extrabold text-foreground">{profile?.experience_years || 0} Years</div>
              <div className="text-xs text-muted-foreground font-mono mt-2">
                Clinical practice duration
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-sm border border-border shadow-none bg-card hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardDescription className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Schedule & Slots
              </CardDescription>
              <div className="rounded-sm border border-purple-500/20 bg-purple-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-purple-600">
                [ AVAILABILITY ]
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-hanken text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">Active</div>
              <div className="text-xs text-muted-foreground font-mono mt-2">
                Weekly availability engine live
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Practice & Consultation Management Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-sm border border-border shadow-none bg-card hover:border-primary transition-colors flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="font-hanken text-base font-bold uppercase tracking-wider flex items-center justify-between gap-2">
                <span>Profile Editor</span>
                <Link href="/dashboard/doctor/profile">
                  <Button size="sm" variant="outline" className="font-mono text-xs font-bold shadow-none rounded-sm border-border">
                    [ EDIT ] -&gt;
                  </Button>
                </Link>
              </CardTitle>
              <CardDescription className="font-mono text-xs mt-2">
                Manage your clinical qualifications, location, consultation fees, and public biography.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="rounded-sm border border-border shadow-none bg-card hover:border-primary transition-colors flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="font-hanken text-base font-bold uppercase tracking-wider flex items-center justify-between gap-2">
                <span>Weekly Schedule</span>
                <Link href="/dashboard/doctor/availability">
                  <Button size="sm" variant="outline" className="font-mono text-xs font-bold shadow-none rounded-sm border-border">
                    [ SCHEDULE ] -&gt;
                  </Button>
                </Link>
              </CardTitle>
              <CardDescription className="font-mono text-xs mt-2">
                Configure working days, appointment time slots, duration, and daily break periods.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="rounded-sm border border-border shadow-none bg-card hover:border-primary transition-colors flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="font-hanken text-base font-bold uppercase tracking-wider flex items-center justify-between gap-2">
                <span>Consultations</span>
                <Link href="/dashboard/doctor/appointments">
                  <Button size="sm" variant="outline" className="font-mono text-xs font-bold shadow-none rounded-sm border-border">
                    [ MANAGE ] -&gt;
                  </Button>
                </Link>
              </CardTitle>
              <CardDescription className="font-mono text-xs mt-2">
                Review incoming patient appointment requests, confirm schedules, and complete visits.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Professional Bio & Practice Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-sm border border-border shadow-none bg-card md:col-span-2">
            <CardHeader className="border-b border-border bg-muted/20 pb-4">
              <CardTitle className="font-hanken text-base font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Professional Bio & Expertise</span>
                <span className="text-xs font-mono text-primary font-bold">[ BIO ]</span>
              </CardTitle>
              <CardDescription className="font-mono text-xs">Your clinical background presented to patients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm font-mono pt-4">
              <p className="p-4 rounded-sm bg-muted/30 border border-border italic text-foreground">
                &ldquo;{profile?.bio || "No professional biography provided yet."}&rdquo;
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase block">Email Account</span>
                  <span className="font-bold text-foreground text-xs">{user?.email}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase block">Account Status</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">ACTIVE (JWT SECURED)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-sm border border-border shadow-none bg-card">
            <CardHeader className="border-b border-border bg-muted/20 pb-4">
              <CardTitle className="font-hanken text-base font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Compliance</span>
                <span className="text-xs font-mono text-primary font-bold">[ SECURITY ]</span>
              </CardTitle>
              <CardDescription className="font-mono text-xs">Authentication & Data Integrity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 font-mono text-xs text-muted-foreground">
              <div className="p-3 rounded-sm bg-muted/20 border border-border">
                <p className="font-bold text-foreground mb-1 uppercase text-[11px]">[ LICENSE UNIQUENESS ENFORCED ]</p>
                <p className="text-[11px] leading-relaxed">Database unique constraint prevents duplicate medical license registrations across the platform.</p>
              </div>
              <div className="p-3 rounded-sm bg-muted/20 border border-border">
                <p className="font-bold text-foreground mb-1 uppercase text-[11px]">[ ROLE AUTHORIZATION ]</p>
                <p className="text-[11px] leading-relaxed">Your DOCTOR role badge is cryptographically signed inside your JWT access token.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
