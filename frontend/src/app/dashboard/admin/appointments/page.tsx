"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/loader";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Pending Approval", value: "PENDING" },
  { label: "Confirmed / Scheduled", value: "CONFIRMED" },
  { label: "Completed Consultations", value: "COMPLETED" },
  { label: "Cancelled Bookings", value: "CANCELLED" },
  { label: "Rejected by Provider", value: "REJECTED" },
];

export default function AdminAppointmentsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const queryParams = {
    page,
    page_size: 15,
    status: statusFilter || undefined,
  };

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["admin-appointments", queryParams],
    queryFn: () => adminService.listAppointments(queryParams),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "CONFIRMED":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "PENDING":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "CANCELLED":
        return "bg-rose-500/10 text-rose-600 border-rose-500/20";
      case "REJECTED":
        return "bg-slate-500/10 text-slate-600 border-slate-500/20";
      default:
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
    }
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header Banner */}
        <div className="rounded-sm border border-border bg-card p-6 md:p-8 text-card-foreground shadow-none flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-sm bg-primary/10 px-3 py-1 text-xs font-mono font-bold text-primary border border-primary/20 uppercase tracking-wider">
              <span>[ CONSULTATION OVERSIGHT ]</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight font-hanken">
              Appointment Governance
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl font-mono">
              Centralized monitoring of all patient-doctor consultations, scheduling lifecycles, and audit logs.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="gap-2 border-border font-mono font-bold shadow-none rounded-sm uppercase tracking-wider"
          >
            <span>{isRefetching ? "[ REFRESHING... ]" : "[ REFRESH LOG ]"}</span>
          </Button>
        </div>

        {/* Filter Toolbar */}
        <Card className="rounded-sm border-border shadow-none">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:w-64">
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-sm border-border font-mono text-xs shadow-none"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="text-xs text-muted-foreground self-end sm:self-center font-mono">
              SHOWING <span className="font-bold text-foreground">{data?.data?.length || 0}</span> OF{" "}
              <span className="font-bold text-foreground">{data?.total || 0}</span> TOTAL APPOINTMENTS
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card className="rounded-sm border-border shadow-none">
          <CardHeader className="border-b border-border bg-muted/20">
            <CardTitle className="text-lg font-hanken uppercase tracking-wider flex items-center justify-between">
              <span>Global Consultation Registry</span>
              <span className="text-xs font-mono text-primary font-bold">[ AUDIT TRAIL ]</span>
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              Complete audit trail of all platform appointment bookings and status changes.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-12 flex justify-center">
                <Spinner size={40} />
              </div>
            ) : error ? (
              <div className="p-6 bg-destructive/10 text-destructive text-xs font-mono font-bold text-center border-b border-border">
                [ ERROR: FAILED TO LOAD APPOINTMENT RECORDS. PLEASE ENSURE ADMINISTRATIVE PERMISSIONS. ]
              </div>
            ) : data && data.data && data.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="py-3 px-4">Schedule</th>
                      <th className="py-3 px-4">Doctor</th>
                      <th className="py-3 px-4">Patient</th>
                      <th className="py-3 px-4">Reason & Notes</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Logged At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-mono text-xs">
                    {data.data.map((apt) => (
                      <tr key={apt.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-bold text-foreground font-hanken text-sm">
                            <span className="text-muted-foreground font-mono font-normal text-xs">DATE:</span> {apt.appointment_date}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            <span className="font-bold text-muted-foreground">TIME:</span> {apt.start_time} - {apt.end_time}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-foreground font-hanken text-sm">
                            <span className="text-muted-foreground font-mono font-normal text-xs">DR:</span> {apt.doctor ? `${apt.doctor.first_name} ${apt.doctor.last_name}` : "UNKNOWN"}
                          </div>
                          <div className="text-xs text-muted-foreground uppercase">
                            {apt.doctor?.specialization || "GENERAL MEDICINE"}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-foreground font-hanken text-sm">
                            <span className="text-muted-foreground font-mono font-normal text-xs">PT:</span> {apt.patient ? `${apt.patient.first_name} ${apt.patient.last_name}` : "UNKNOWN"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <span className="font-bold text-muted-foreground">TEL:</span> {apt.patient?.phone_number || "NO CONTACT"}
                          </div>
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-medium text-foreground truncate">
                            <span className="font-bold text-muted-foreground">REASON:</span> {apt.reason_for_visit}
                          </div>
                          {apt.notes && (
                            <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                              <span className="font-bold">NOTE:</span> {apt.notes}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold border uppercase tracking-wider",
                              getStatusBadge(apt.status)
                            )}
                          >
                            [ {apt.status} ]
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right text-xs text-muted-foreground whitespace-nowrap">
                          <div>{new Date(apt.created_at).toLocaleDateString()}</div>
                          <div className="text-[10px] opacity-75">
                            {new Date(apt.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center space-y-2 font-mono">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">[ EMPTY REGISTRY ]</div>
                <h3 className="font-bold text-foreground font-hanken text-base">No appointments found</h3>
                <p className="text-xs text-muted-foreground">
                  Try clearing your status filter to see all records.
                </p>
              </div>
            )}

            {/* Pagination */}
            {data && data.total_pages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-border font-mono text-xs">
                <div className="text-muted-foreground">
                  PAGE <span className="font-bold text-foreground">{data.page}</span> OF{" "}
                  <span className="font-bold text-foreground">{data.total_pages}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-sm font-mono text-xs font-bold shadow-none"
                  >
                    [ PREV ]
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                    disabled={page === data.total_pages}
                    className="rounded-sm font-mono text-xs font-bold shadow-none"
                  >
                    [ NEXT ]
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
