"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { appointmentService } from "@/services/appointment.service";
import { Appointment, AppointmentStatus, PaginatedAppointmentResponse } from "@/types/appointment";
import { toast } from "sonner";

export const DoctorAppointmentsList: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedDate, setSelectedDate] = useState<string>("");
  
  // Modal states for actions requiring notes
  const [actionAppt, setActionAppt] = useState<{ appt: Appointment; type: "REJECT" | "CANCEL" } | null>(null);
  const [actionNotes, setActionNotes] = useState<string>("");

  const { data, isLoading, isError, error, refetch } = useQuery<PaginatedAppointmentResponse, Error>({
    queryKey: ["doctor-appointments", selectedStatus, selectedDate],
    queryFn: () =>
      appointmentService.getDoctorAppointments({
        status: selectedStatus === "ALL" ? undefined : (selectedStatus as AppointmentStatus),
        date: selectedDate || undefined,
        page_size: 50,
        size: 50,
      }),
    staleTime: 30 * 1000,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: AppointmentStatus; notes?: string }) =>
      appointmentService.updateAppointmentStatus(id, { status, notes }),
    onSuccess: (_, variables) => {
      toast.success(`Appointment marked as ${variables.status.toLowerCase()}`);
      setActionAppt(null);
      setActionNotes("");
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["available-slots"] });
    },
    onError: (err: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any)?.response?.data?.message || (err as any)?.message || "Failed to update status.";
      toast.error(msg);
    },
  });

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        return (
          <span className="inline-block px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[11px] border border-emerald-500/20 uppercase tracking-wider">
            [ CONFIRMED ]
          </span>
        );
      case AppointmentStatus.PENDING:
        return (
          <span className="inline-block px-2 py-0.5 rounded-sm bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-bold text-[11px] border border-amber-500/20 uppercase tracking-wider animate-pulse">
            [ PENDING APPROVAL ]
          </span>
        );
      case AppointmentStatus.COMPLETED:
        return (
          <span className="inline-block px-2 py-0.5 rounded-sm bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-bold text-[11px] border border-blue-500/20 uppercase tracking-wider">
            [ COMPLETED ]
          </span>
        );
      case AppointmentStatus.CANCELLED:
        return (
          <span className="inline-block px-2 py-0.5 rounded-sm bg-destructive/10 text-destructive font-mono font-bold text-[11px] border border-destructive/20 uppercase tracking-wider">
            [ CANCELLED ]
          </span>
        );
      case AppointmentStatus.REJECTED:
        return (
          <span className="inline-block px-2 py-0.5 rounded-sm bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono font-bold text-[11px] border border-rose-500/20 uppercase tracking-wider">
            [ REJECTED ]
          </span>
        );
      default:
        return <span className="inline-block px-2 py-0.5 rounded-sm bg-muted text-muted-foreground font-mono text-[11px] font-bold uppercase border border-border">[ {status} ]</span>;
    }
  };

  const handleQuickConfirm = (id: string) => {
    statusMutation.mutate({ id, status: AppointmentStatus.CONFIRMED });
  };

  const handleQuickComplete = (id: string) => {
    statusMutation.mutate({ id, status: AppointmentStatus.COMPLETED });
  };

  const handleOpenModal = (appt: Appointment, type: "REJECT" | "CANCEL") => {
    setActionAppt({ appt, type });
    setActionNotes("");
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight font-hanken uppercase text-foreground">Patient Appointments</h1>
          <p className="text-xs text-muted-foreground">Review incoming booking requests, confirm schedules, or mark consultations completed.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Filter */}
          <div className="flex items-center gap-1.5 bg-muted/20 px-2.5 py-1 rounded-sm border border-border">
            <span className="text-xs font-bold text-muted-foreground uppercase">[ DATE ]:</span>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-7 w-36 text-xs border-0 bg-transparent p-0 font-mono shadow-none focus-visible:ring-0"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate("")}
                className="text-xs text-muted-foreground hover:text-foreground font-bold px-1 uppercase"
              >
                [ CLEAR ]
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((status) => (
              <Button
                key={status}
                size="sm"
                variant={selectedStatus === status ? "default" : "outline"}
                onClick={() => setSelectedStatus(status)}
                className="text-xs font-bold h-8 px-3 rounded-sm shadow-none uppercase tracking-wider border-border"
              >
                [ {status} ]
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* List Content */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 border border-border border-dashed rounded-sm bg-muted/10">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">[ LOADING APPOINTMENTS... ]</span>
        </div>
      ) : isError ? (
        <Card className="border-destructive/40 text-center py-12 rounded-sm shadow-none bg-destructive/5">
          <CardContent className="space-y-4 pt-6">
            <div className="text-destructive font-bold text-xs uppercase">[ ERROR: FAILED TO LOAD APPOINTMENTS ]</div>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              {error?.message || "An unexpected error occurred while communicating with the server."}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-sm shadow-none text-xs font-bold uppercase tracking-wider">
              [ TRY AGAIN ]
            </Button>
          </CardContent>
        </Card>
      ) : !data || data.data.length === 0 ? (
        <Card className="text-center py-16 border-dashed border-border rounded-sm shadow-none bg-muted/10">
          <CardContent className="space-y-4 pt-6">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">[ NO APPOINTMENTS FOUND ]</div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {selectedStatus === "ALL" && !selectedDate
                  ? "No patient bookings have been made with your practice yet."
                  : `No appointments match the selected filter criteria.`}
              </p>
            </div>
            {(selectedStatus !== "ALL" || selectedDate) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedStatus("ALL");
                  setSelectedDate("");
                }}
                className="rounded-sm shadow-none text-xs font-bold uppercase tracking-wider border-border"
              >
                [ CLEAR FILTERS ]
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.data.map((appt) => {
            const patient = appt.patient;
            const patientName = patient
              ? `${patient.first_name} ${patient.last_name}`
              : "Registered Patient";

            return (
              <Card key={appt.id} className="overflow-hidden rounded-sm border border-border shadow-none bg-card hover:border-foreground/40 transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Patient info & time */}
                    <div className="space-y-3.5 flex-1">
                      <div className="flex items-start justify-between sm:justify-start gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-sm bg-muted border border-border text-foreground font-extrabold text-base flex items-center justify-center shrink-0">
                            <span>[{patient?.first_name?.[0] || ""}{patient?.last_name?.[0] || ""}]</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-extrabold font-hanken uppercase text-foreground">{patientName}</h3>
                              {getStatusBadge(appt.status)}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground font-bold pt-1 uppercase">
                              {patient?.phone_number && (
                                <span>[ PHONE: {patient.phone_number} ]</span>
                              )}
                              {patient?.gender && <span>[ GENDER: {patient.gender} ]</span>}
                              {patient?.blood_group && (
                                <span className="text-rose-500 font-bold">
                                  [ BLOOD: {patient.blood_group} ]
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Date & Time pills */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-muted/30 text-foreground font-bold text-xs border border-border">
                          <span>[ DATE: {appt.appointment_date} ]</span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-muted/30 text-foreground font-bold text-xs border border-border">
                          <span>[ TIME: {appt.start_time.slice(0, 5)} - {appt.end_time.slice(0, 5)} ]</span>
                        </div>
                      </div>

                      {/* Reason & Notes */}
                      <div className="p-3.5 rounded-sm bg-muted/20 border border-border text-xs text-muted-foreground space-y-1.5">
                        <div className="flex items-start gap-2">
                          <div>
                            <span className="font-bold text-foreground block uppercase tracking-wider text-[10px]">
                              [ PATIENT REPORTED REASON / SYMPTOMS ]:
                            </span>
                            <p className="italic text-foreground/90">{appt.reason_for_visit}</p>
                          </div>
                        </div>
                        {appt.notes && (
                          <div className="pt-2 mt-2 border-t border-border text-foreground">
                            <span className="font-bold text-[10px] uppercase tracking-wider block text-muted-foreground">
                              [ STATUS NOTES / REASON ]:
                            </span>
                            <p className="font-medium">{appt.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap lg:flex-col items-center justify-end gap-2.5 shrink-0 border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-6">
                      {appt.status === AppointmentStatus.PENDING && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleQuickConfirm(appt.id)}
                            disabled={statusMutation.isPending}
                            className="w-full sm:w-auto lg:w-40 font-mono font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-none rounded-sm uppercase tracking-wider"
                          >
                            [ CONFIRM SLOT ]
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenModal(appt, "REJECT")}
                            disabled={statusMutation.isPending}
                            className="w-full sm:w-auto lg:w-40 font-mono font-bold text-xs border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 shadow-none rounded-sm uppercase tracking-wider"
                          >
                            [ REJECT REQUEST ]
                          </Button>
                        </>
                      )}

                      {appt.status === AppointmentStatus.CONFIRMED && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleQuickComplete(appt.id)}
                            disabled={statusMutation.isPending}
                            className="w-full sm:w-auto lg:w-40 font-mono font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-none rounded-sm uppercase tracking-wider"
                          >
                            [ MARK COMPLETED ]
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenModal(appt, "CANCEL")}
                            disabled={statusMutation.isPending}
                            className="w-full sm:w-auto lg:w-40 font-mono font-bold text-xs border-destructive/40 text-destructive hover:bg-destructive/10 shadow-none rounded-sm uppercase tracking-wider"
                          >
                            [ CANCEL SLOT ]
                          </Button>
                        </>
                      )}

                      {appt.status !== AppointmentStatus.PENDING && appt.status !== AppointmentStatus.CONFIRMED && (
                        <span className="text-[11px] font-bold text-muted-foreground uppercase text-center px-4 py-2 bg-muted/20 rounded-sm border border-border">
                          [ NO ACTIONS ]
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Reject / Cancel Modal */}
      <Modal
        isOpen={!!actionAppt}
        onClose={() => !statusMutation.isPending && setActionAppt(null)}
        title={actionAppt?.type === "REJECT" ? "Reject Appointment Request" : "Cancel Confirmed Appointment"}
        description={
          actionAppt?.type === "REJECT"
            ? "Provide an optional reason for rejecting this consultation request."
            : "Provide a reason for cancelling this confirmed appointment."
        }
        className="max-w-md rounded-sm border border-border shadow-none"
      >
        <div className="space-y-4 pt-2 font-mono">
          {actionAppt && (
            <div className="p-3 rounded-sm bg-muted/20 border border-border text-xs space-y-1">
              <p className="font-bold text-foreground uppercase">
                [ PATIENT: {actionAppt.appt.patient?.first_name} {actionAppt.appt.patient?.last_name} ]
              </p>
              <p className="text-muted-foreground">
                [ {actionAppt.appt.appointment_date} | {actionAppt.appt.start_time.slice(0, 5)} - {actionAppt.appt.end_time.slice(0, 5)} ]
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              {actionAppt?.type === "REJECT" ? "Rejection Reason (Optional)" : "Cancellation Reason (Optional)"}
            </label>
            <Textarea
              rows={3}
              placeholder="[ E.G., DOCTOR UNAVAILABLE, SCHEDULE CONFLICT, ETC. ]"
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              className="resize-none text-xs rounded-sm shadow-none border-border"
              maxLength={500}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActionAppt(null)}
              disabled={statusMutation.isPending}
              className="rounded-sm shadow-none text-xs font-bold uppercase tracking-wider border-border"
            >
              [ BACK ]
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                if (!actionAppt) return;
                statusMutation.mutate({
                  id: actionAppt.appt.id,
                  status: actionAppt.type === "REJECT" ? AppointmentStatus.REJECTED : AppointmentStatus.CANCELLED,
                  notes: actionNotes || undefined,
                });
              }}
              disabled={statusMutation.isPending}
              className="rounded-sm shadow-none font-bold px-5 text-xs uppercase tracking-wider"
            >
              {statusMutation.isPending ? "[ PROCESSING... ]" : actionAppt?.type === "REJECT" ? "[ CONFIRM REJECTION ]" : "[ CONFIRM CANCELLATION ]"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
