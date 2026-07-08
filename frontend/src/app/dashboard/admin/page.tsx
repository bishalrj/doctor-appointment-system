"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loader";
import { ProtectedRoute } from "@/components/auth/protected-route";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { data: analytics, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => adminService.getAnalytics(),
  });

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <div className="flex h-[80vh] items-center justify-center">
          <Spinner size={48} />
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !analytics) {
    return (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
          <div className="inline-block rounded-sm border border-destructive/30 bg-destructive/5 px-3 py-1 font-mono text-xs font-bold text-destructive uppercase tracking-wider">
            [ ERROR: ANALYTICS LOAD FAILED ]
          </div>
          <h2 className="font-hanken text-xl font-bold">Failed to load System Analytics</h2>
          <p className="text-muted-foreground text-xs max-w-md mx-auto">
            Please ensure you have administrative permissions and the backend server is reachable.
          </p>
          <Button onClick={() => refetch()} variant="outline" className="font-bold uppercase tracking-wider text-xs shadow-none border border-border">
            TRY AGAIN
          </Button>
        </div>
      </ProtectedRoute>
    );
  }

  // Calculate max values for bar chart percentages
  const maxStatusCount = Math.max(...(analytics.appointments_by_status?.map((s) => s.count) || [1]), 1);
  const maxSpecCount = Math.max(...(analytics.doctors_by_specialization?.map((s) => s.count) || [1]), 1);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-emerald-600 text-emerald-600";
      case "CONFIRMED": return "bg-blue-600 text-blue-600";
      case "PENDING": return "bg-amber-600 text-amber-600";
      case "CANCELLED": return "bg-rose-600 text-rose-600";
      default: return "bg-purple-600 text-purple-600";
    }
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Banner */}
        <div className="rounded-sm border border-border bg-card p-6 md:p-8 shadow-none flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-block rounded-sm border border-primary/20 bg-primary/5 px-2.5 py-0.5 font-mono text-[10px] font-bold text-primary uppercase tracking-wider">
              [ SYSTEM GOVERNANCE CONSOLE ]
            </div>
            <h1 className="font-hanken text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Platform Overview & Analytics
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm max-w-xl">
              Real-time platform metrics, verification queue monitoring, and centralized administrative control.
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="font-bold uppercase tracking-wider text-xs shadow-none border border-border"
            >
              {isRefetching ? "REFRESHING..." : "REFRESH METRICS"}
            </Button>
          </div>
        </div>

        {/* Primary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-border rounded-sm shadow-none bg-card hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Doctors</CardTitle>
              <div className="rounded-sm border border-border bg-muted/30 px-1.5 py-0.5 font-mono text-[9px] font-bold text-muted-foreground">
                [ MD ]
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-hanken text-3xl font-extrabold">{analytics.total_doctors}</div>
              <div className="flex items-center gap-2 mt-2 font-mono text-[11px]">
                <span className="text-emerald-600 font-bold">
                  {analytics.verified_doctors} Verified
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-amber-600 font-semibold">{analytics.unverified_doctors} Pending</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border rounded-sm shadow-none bg-card hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Patients</CardTitle>
              <div className="rounded-sm border border-border bg-muted/30 px-1.5 py-0.5 font-mono text-[9px] font-bold text-muted-foreground">
                [ PT ]
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-hanken text-3xl font-extrabold">{analytics.total_patients}</div>
              <div className="flex items-center gap-1 mt-2 font-mono text-[11px] text-muted-foreground">
                <span>Active registered accounts</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border rounded-sm shadow-none bg-card hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Appointments</CardTitle>
              <div className="rounded-sm border border-border bg-muted/30 px-1.5 py-0.5 font-mono text-[9px] font-bold text-muted-foreground">
                [ APT ]
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-hanken text-3xl font-extrabold">{analytics.total_appointments}</div>
              <div className="flex items-center gap-2 mt-2 font-mono text-[11px]">
                <span className="text-emerald-600 font-semibold">{analytics.completed_appointments} Completed</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-rose-600 font-semibold">{analytics.cancelled_appointments} Cancelled</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border rounded-sm shadow-none bg-card hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Today&apos;s Schedule</CardTitle>
              <div className="rounded-sm border border-border bg-muted/30 px-1.5 py-0.5 font-mono text-[9px] font-bold text-muted-foreground">
                [ TODAY ]
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-hanken text-3xl font-extrabold">{analytics.today_appointments}</div>
              <div className="flex items-center gap-1 mt-2 font-mono text-[11px] text-amber-600 font-medium">
                <span>{analytics.pending_appointments} Pending platform action</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/dashboard/admin/doctors">
            <Card className="border border-border rounded-sm shadow-none bg-card hover:border-primary transition-colors cursor-pointer group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="rounded-sm border border-border bg-muted/30 px-1.5 py-0.5 font-mono text-[9px] font-bold text-muted-foreground w-fit">
                    [ GOVERNANCE ]
                  </div>
                  <h3 className="font-hanken font-bold text-sm">Doctor Governance</h3>
                  <p className="text-xs text-muted-foreground">Verify credentials & manage accounts</p>
                </div>
                <div className="font-mono text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">
                  [ VIEW ] -&gt;
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/admin/patients">
            <Card className="border border-border rounded-sm shadow-none bg-card hover:border-primary transition-colors cursor-pointer group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="rounded-sm border border-border bg-muted/30 px-1.5 py-0.5 font-mono text-[9px] font-bold text-muted-foreground w-fit">
                    [ DIRECTORY ]
                  </div>
                  <h3 className="font-hanken font-bold text-sm">Patient Directory</h3>
                  <p className="text-xs text-muted-foreground">View records & manage status</p>
                </div>
                <div className="font-mono text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">
                  [ VIEW ] -&gt;
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/admin/appointments">
            <Card className="border border-border rounded-sm shadow-none bg-card hover:border-primary transition-colors cursor-pointer group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="rounded-sm border border-border bg-muted/30 px-1.5 py-0.5 font-mono text-[9px] font-bold text-muted-foreground w-fit">
                    [ OVERSIGHT ]
                  </div>
                  <h3 className="font-hanken font-bold text-sm">Appointment Oversight</h3>
                  <p className="text-xs text-muted-foreground">Monitor platform consultations</p>
                </div>
                <div className="font-mono text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">
                  [ VIEW ] -&gt;
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Analytics Charts & Distributions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appointment Status Distribution */}
          <Card className="border border-border rounded-sm shadow-none bg-card">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="font-hanken text-base font-bold">
                Appointment Status Distribution
              </CardTitle>
              <CardDescription className="text-xs">Breakdown of all consultations by current status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {analytics.appointments_by_status && analytics.appointments_by_status.length > 0 ? (
                analytics.appointments_by_status.map((item) => {
                  const percentage = Math.round((item.count / (analytics.total_appointments || 1)) * 100);
                  const widthPercent = Math.max(Math.round((item.count / maxStatusCount) * 100), 5);
                  return (
                    <div key={item.status} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="flex items-center gap-2 font-mono">
                          <span className={cn("h-2 w-2 rounded-sm", getStatusColor(item.status).split(" ")[0])} />
                          {item.status}
                        </span>
                        <span className="text-muted-foreground font-mono text-xs">
                          {item.count} <span className="text-[10px] opacity-75">({percentage}%)</span>
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted/60 rounded-sm overflow-hidden">
                        <div
                          className={cn("h-full rounded-sm transition-all duration-500", getStatusColor(item.status).split(" ")[0])}
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground font-mono">
                  [ NO APPOINTMENT DATA AVAILABLE ]
                </div>
              )}
            </CardContent>
          </Card>

          {/* Doctors by Specialization */}
          <Card className="border border-border rounded-sm shadow-none bg-card">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="font-hanken text-base font-bold">
                Doctor Specialization Matrix
              </CardTitle>
              <CardDescription className="text-xs">Distribution of active specialists across medical fields</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {analytics.doctors_by_specialization && analytics.doctors_by_specialization.length > 0 ? (
                analytics.doctors_by_specialization.map((item) => {
                  const percentage = Math.round((item.count / (analytics.total_doctors || 1)) * 100);
                  const widthPercent = Math.max(Math.round((item.count / maxSpecCount) * 100), 5);
                  return (
                    <div key={item.specialization} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span>{item.specialization}</span>
                        <span className="text-muted-foreground font-mono text-xs">
                          {item.count} doctors <span className="text-[10px] opacity-75">({percentage}%)</span>
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted/60 rounded-sm overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-sm transition-all duration-500"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground font-mono">
                  [ NO SPECIALIZATION DATA AVAILABLE ]
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Appointments Table */}
        <Card className="border border-border rounded-sm shadow-none bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
            <div>
              <CardTitle className="font-hanken text-base font-bold">
                Recent Platform Appointments
              </CardTitle>
              <CardDescription className="text-xs">Latest consultation bookings across all doctors and patients</CardDescription>
            </div>
            <Link href="/dashboard/admin/appointments">
              <Button variant="outline" size="sm" className="font-bold uppercase tracking-wider text-xs shadow-none border border-border">
                VIEW ALL -&gt;
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {analytics.recent_appointments && analytics.recent_appointments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Doctor</th>
                      <th className="py-3 px-4">Patient</th>
                      <th className="py-3 px-4">Reason</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {analytics.recent_appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-semibold">{apt.appointment_date}</div>
                          <div className="text-[11px] font-mono text-muted-foreground">{apt.start_time} - {apt.end_time}</div>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {apt.doctor ? `Dr. ${apt.doctor.first_name} ${apt.doctor.last_name}` : "Unknown Doctor"}
                          <div className="text-[10px] font-mono text-muted-foreground uppercase">{apt.doctor?.specialization}</div>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {apt.patient ? `${apt.patient.first_name} ${apt.patient.last_name}` : "Unknown Patient"}
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-muted-foreground">
                          {apt.reason_for_visit}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={cn(
                              "inline-block px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold uppercase tracking-wider border",
                              apt.status === "COMPLETED" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                              apt.status === "CONFIRMED" && "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
                              apt.status === "PENDING" && "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                              apt.status === "CANCELLED" && "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
                              apt.status === "REJECTED" && "border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-400"
                            )}
                          >
                            [{apt.status}]
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground font-mono">
                [ NO RECENT APPOINTMENTS LOGGED ]
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
