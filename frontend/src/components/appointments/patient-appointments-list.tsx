"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { appointmentService } from "@/services/appointment.service";
import { Appointment, AppointmentStatus, PaginatedAppointmentResponse } from "@/types/appointment";
import { RescheduleModal } from "@/components/appointments/reschedule-modal";
import { toast } from "sonner";

export const PatientAppointmentsList: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [rescheduleAppt, setRescheduleAppt] = useState<Appointment | null>(null);
  const [cancelAppt, setCancelAppt] = useState<Appointment | null>(null);
  const [cancelNotes, setCancelNotes] = useState<string>("");

  const { data, isLoading, isError, error, refetch } = useQuery<PaginatedAppointmentResponse, Error>({
    queryKey: ["my-appointments", selectedStatus],
    queryFn: () =>
      appointmentService.getMyAppointments({
        status: selectedStatus === "ALL" ? undefined : (selectedStatus as AppointmentStatus),
        page_size: 50,
        size: 50,
      }),
    staleTime: 30 * 1000,
  });

  const cancelMutation = useMutation({
    mutationFn: () => {
      if (!cancelAppt) throw new Error("No appointment selected");
      return appointmentService.cancelAppointment(cancelAppt.id, cancelNotes);
    },
    onSuccess: () => {
      toast.success("Appointment cancelled successfully");
      setCancelAppt(null);
      setCancelNotes("");
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["available-slots"] });
    },
    onError: (err: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any)?.response?.data?.message || (err as any)?.message || "Failed to cancel appointment.";
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
            [ PENDING REVIEW ]
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

  const handleOpenCancel = (appt: Appointment) => {
    setCancelAppt(appt);
    setCancelNotes("");
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight font-hanken uppercase text-foreground">My Medical Appointments</h1>
          <p className="text-xs text-muted-foreground">Manage your upcoming consultations, view history, or reschedule.</p>
        </div>
        
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-muted-foreground uppercase mr-1 shrink-0">[ FILTER ]:</span>
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

      {/* List Content */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 border border-border border-dashed rounded-sm bg-muted/10">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">[ LOADING APPOINTMENTS... ]</span>
        </div>
      ) : isError ? (
        <Card className="border-destructive/40 text-center py-12 rounded-sm shadow-none bg-destructive/5">
          <CardContent className="space-y-4">
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
          <CardContent className="space-y-4">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">[ NO APPOINTMENTS FOUND ]</div>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {selectedStatus === "ALL"
                ? "You have not booked any medical appointments yet."
                : `You don't have any appointments with status [ ${selectedStatus} ].`}
            </p>
            {selectedStatus !== "ALL" && (
              <Button variant="outline" size="sm" onClick={() => setSelectedStatus("ALL")} className="rounded-sm shadow-none text-xs font-bold uppercase tracking-wider border-border">
                [ VIEW ALL APPOINTMENTS ]
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.data.map((appt) => {
            const doc = appt.doctor;
            const docName = doc
              ? `Dr. ${doc.first_name?.replace(/^Dr\.\s*|^Dr\s+/i, "")} ${doc.last_name}`
              : "Medical Practitioner";
            const canModify = appt.status === AppointmentStatus.PENDING || appt.status === AppointmentStatus.CONFIRMED;

            return (
              <Card key={appt.id} className="overflow-hidden rounded-sm border border-border shadow-none bg-card hover:border-foreground/40 transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Doctor info & time */}
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-sm bg-muted border border-border text-foreground font-extrabold text-base flex items-center justify-center shrink-0">
                          {doc?.profile_photo ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={doc.profile_photo} alt={docName} className="h-full w-full object-cover rounded-sm" />
                          ) : (
                            <span>[{doc?.first_name?.[0] || ""}{doc?.last_name?.[0] || ""}]</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-extrabold font-hanken uppercase text-foreground">{docName}</h3>
                            {getStatusBadge(appt.status)}
                          </div>
                          <p className="text-xs font-bold text-primary flex items-center gap-1.5 mt-0.5 uppercase">
                            <span>[ SPEC: {doc?.specialization || "GENERAL SPECIALIST"} ]</span>
                            {doc?.qualification && <span className="text-muted-foreground font-normal">({doc.qualification})</span>}
                          </p>
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

                      {/* Reason */}
                      <div className="p-3 rounded-sm bg-muted/20 border border-border text-xs text-muted-foreground space-y-1">
                        <span className="font-bold text-foreground block uppercase tracking-wider text-[10px]">
                          [ REASON FOR VISIT / SYMPTOMS ]:
                        </span>
                        <p className="italic text-foreground/90">{appt.reason_for_visit}</p>
                        {appt.notes && (
                          <div className="pt-1.5 mt-1.5 border-t border-border text-destructive font-bold text-[11px]">
                            <span>[ NOTES / REASON ]: </span>{appt.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex md:flex-col items-center justify-end gap-2.5 shrink-0 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                      {canModify ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRescheduleAppt(appt)}
                            className="w-full sm:w-auto md:w-36 font-mono font-bold text-xs border-border text-foreground hover:bg-muted/30 rounded-sm shadow-none uppercase tracking-wider"
                          >
                            [ RESCHEDULE ]
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenCancel(appt)}
                            className="w-full sm:w-auto md:w-36 font-mono font-bold text-xs border-destructive/40 text-destructive hover:bg-destructive/10 rounded-sm shadow-none uppercase tracking-wider"
                          >
                            [ CANCEL SLOT ]
                          </Button>
                        </>
                      ) : (
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

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={!!rescheduleAppt}
        onClose={() => setRescheduleAppt(null)}
        appointment={rescheduleAppt}
      />

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!cancelAppt}
        onClose={() => !cancelMutation.isPending && setCancelAppt(null)}
        title="Cancel Appointment"
        description="Are you sure you want to cancel this scheduled consultation?"
        className="max-w-md rounded-sm border border-border shadow-none"
      >
        <div className="space-y-4 pt-2 font-mono">
          {cancelAppt && (
            <div className="p-3 rounded-sm bg-destructive/10 border border-destructive/20 text-xs space-y-1">
              <p className="font-bold text-foreground uppercase">
                [ DR. {cancelAppt.doctor?.first_name?.replace(/^Dr\.\s*|^Dr\s+/i, "")} {cancelAppt.doctor?.last_name} ]
              </p>
              <p className="text-muted-foreground">
                [ {cancelAppt.appointment_date} | {cancelAppt.start_time.slice(0, 5)} - {cancelAppt.end_time.slice(0, 5)} ]
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Reason for Cancellation (Optional)
            </label>
            <Textarea
              rows={3}
              placeholder="[ E.G., FEELING BETTER, SCHEDULING CONFLICT, ETC. ]"
              value={cancelNotes}
              onChange={(e) => setCancelNotes(e.target.value)}
              className="resize-none text-xs rounded-sm shadow-none border-border"
              maxLength={500}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCancelAppt(null)}
              disabled={cancelMutation.isPending}
              className="rounded-sm shadow-none text-xs font-bold uppercase tracking-wider border-border"
            >
              [ KEEP SLOT ]
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              className="rounded-sm shadow-none font-bold px-5 text-xs uppercase tracking-wider"
            >
              {cancelMutation.isPending ? "[ CANCELLING... ]" : "[ YES, CANCEL SLOT ]"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
