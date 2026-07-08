"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const profile = user?.patient_profile;

  return (
    <ProtectedRoute allowedRoles={["PATIENT"]}>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Welcome Banner */}
        <div className="rounded-sm border border-border bg-card p-6 md:p-8 text-card-foreground shadow-none flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-sm bg-primary/10 px-3 py-1 text-xs font-mono font-bold text-primary border border-primary/20 uppercase tracking-wider">
              <span>[ PATIENT PORTAL • ACTIVE ]</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight font-hanken">
              Welcome back, {profile?.first_name || "Patient"}!
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl font-mono">
              Your authentication session is secured via stateless JWT rotation. Appointment Booking & Scheduling is live.
            </p>
          </div>
          <div className="shrink-0">
            <Link href="/dashboard/patient/doctors">
              <Button variant="outline" size="lg" className="font-mono font-bold shadow-none rounded-sm border-border uppercase tracking-wider">
                <span>[ FIND DOCTORS ] -&gt;</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-sm border border-border shadow-none bg-card hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardDescription className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Blood Group
              </CardDescription>
              <div className="rounded-sm border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-rose-600">
                [ BLOOD ]
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-hanken text-3xl font-extrabold text-foreground">{profile?.blood_group || "N/A"}</div>
              <div className="text-xs text-muted-foreground font-mono mt-2">
                Recorded in medical profile
              </div>
            </CardContent>
          </Card>

          <Link href="/dashboard/patient/appointments" className="block">
            <Card className="rounded-sm border border-border shadow-none bg-card hover:border-primary transition-all cursor-pointer h-full">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardDescription className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  My Appointments
                </CardDescription>
                <div className="rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-600">
                  [ SCHEDULE ]
                </div>
              </CardHeader>
              <CardContent>
                <div className="font-hanken text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">View All -&gt;</div>
                <div className="text-xs text-muted-foreground font-mono mt-2">
                  Manage your scheduled consultations
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="rounded-sm border border-border shadow-none bg-card hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardDescription className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Medical Records
              </CardDescription>
              <div className="rounded-sm border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-600">
                [ RECORDS ]
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-hanken text-3xl font-extrabold text-foreground">Phase 4</div>
              <div className="text-xs text-muted-foreground font-mono mt-2">
                Prescription & test report vault
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Summary & Emergency Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-sm border border-border shadow-none bg-card">
            <CardHeader className="border-b border-border bg-muted/20 pb-4">
              <CardTitle className="font-hanken text-base font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Personal Information</span>
                <span className="text-xs font-mono text-primary font-bold">[ DEMOGRAPHICS ]</span>
              </CardTitle>
              <CardDescription className="font-mono text-xs">Your registered demographic and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm font-mono pt-4">
              <div className="grid grid-cols-2 gap-4 border-b border-border pb-3">
                <div>
                  <span className="text-muted-foreground block text-[11px] uppercase">Full Name</span>
                  <span className="font-bold text-foreground font-hanken text-base">{profile?.first_name} {profile?.last_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px] uppercase">Email Address</span>
                  <span className="font-bold text-foreground text-xs">{user?.email}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-b border-border pb-3">
                <div>
                  <span className="text-muted-foreground block text-[11px] uppercase">Phone Number</span>
                  <span className="font-bold text-foreground text-xs">{profile?.phone_number || "NOT PROVIDED"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px] uppercase">Gender / DOB</span>
                  <span className="font-bold text-foreground text-xs">{profile?.gender || "N/A"} • {profile?.date_of_birth || "N/A"}</span>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px] uppercase">Residential Address</span>
                <span className="font-bold text-foreground text-xs block mt-0.5">
                  <span className="text-muted-foreground">ADDR:</span> {profile?.address || "NO ADDRESS RECORDED"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-sm border border-border shadow-none bg-card">
            <CardHeader className="border-b border-border bg-muted/20 pb-4">
              <CardTitle className="font-hanken text-base font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Emergency Medical Contact</span>
                <span className="text-xs font-mono text-amber-600 font-bold">[ EMERGENCY ]</span>
              </CardTitle>
              <CardDescription className="font-mono text-xs">Critical contact information for urgent medical scenarios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 font-mono">
              <div className="rounded-sm bg-muted/30 p-4 border border-border">
                <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold block mb-1">
                  Primary Emergency Contact
                </span>
                <p className="text-sm font-bold text-foreground">
                  <span className="text-emerald-600 font-bold">TEL:</span> {profile?.emergency_contact || "NO EMERGENCY CONTACT RECORDED"}
                </p>
              </div>

              <div className="rounded-sm bg-muted/20 p-4 border border-border text-xs text-muted-foreground space-y-1">
                <p className="font-bold text-foreground uppercase tracking-wider">[ SECURITY VERIFICATION NOTE ]</p>
                <p className="text-[11px] leading-relaxed">
                  Your profile data is strictly tied to your UUID via PostgreSQL Foreign Key constraints. All API queries are protected against IDOR vulnerabilities.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
