"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { appointmentService } from "@/services/appointment.service";
import { TimeSlot, AvailableSlotsResponse, Appointment } from "@/types/appointment";

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onSuccess?: () => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  const getTodayStr = () => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(
    appointment?.appointment_date || getTodayStr()
  );
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const doctorId = appointment?.doctor_id || "";

  const { data: slotsData, isLoading: isLoadingSlots, isError: isErrorSlots, error: slotsError } = useQuery<AvailableSlotsResponse, Error>({
    queryKey: ["available-slots", doctorId, selectedDate],
    queryFn: () => appointmentService.getAvailableSlots(doctorId, selectedDate),
    enabled: isOpen && !!doctorId && !!selectedDate,
    staleTime: 30 * 1000,
  });

  const rescheduleMutation = useMutation({
    mutationFn: () => {
      if (!appointment) throw new Error("No appointment selected");
      if (!selectedSlot) throw new Error("Please select a new time slot");
      return appointmentService.rescheduleAppointment(appointment.id, {
        appointment_date: selectedDate,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
      });
    },
    onSuccess: () => {
      setIsSuccess(true);
      setErrorMsg(null);
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["available-slots", doctorId] });
      if (onSuccess) onSuccess();
    },
    onError: (err: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any)?.response?.data?.message || (err as any)?.message || "Failed to reschedule appointment.";
      setErrorMsg(msg);
    },
  });

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setSelectedSlot(null);
    setErrorMsg(null);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!slot.is_available) return;
    setSelectedSlot(slot);
    setErrorMsg(null);
  };

  const handleClose = () => {
    if (!rescheduleMutation.isPending) {
      setIsSuccess(false);
      setSelectedSlot(null);
      setErrorMsg(null);
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setErrorMsg("Please select an available time slot.");
      return;
    }
    rescheduleMutation.mutate();
  };

  if (!appointment) return null;

  const docName = appointment.doctor
    ? `Dr. ${appointment.doctor.first_name?.replace(/^Dr\.\s*|^Dr\s+/i, "")} ${appointment.doctor.last_name}`
    : "Doctor";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isSuccess ? "Reschedule Confirmed" : `Reschedule: ${docName}`}
      description={
        isSuccess
          ? "Your appointment has been successfully rescheduled."
          : `Current: [${appointment.appointment_date}] (${appointment.start_time.slice(0, 5)} - ${appointment.end_time.slice(0, 5)})`
      }
      className="max-w-2xl rounded-sm border border-border shadow-none"
    >
      {isSuccess ? (
        <div className="py-8 text-center space-y-6 font-mono">
          <div className="rounded-sm border border-primary/20 bg-primary/10 p-4 text-primary font-bold text-xs max-w-xs mx-auto">
            [ RESCHEDULE CONFIRMED ]
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-bold font-hanken uppercase text-foreground">Rescheduled Successfully</h3>
            <p className="text-sm text-muted-foreground font-mono">
              Your appointment is now scheduled for <span className="font-bold text-foreground">[{selectedDate}]</span> at{" "}
              <span className="font-bold text-foreground">[{selectedSlot?.start_time} - {selectedSlot?.end_time}]</span>.
            </p>
          </div>
          <div className="pt-4 flex justify-center">
            <Button
              onClick={handleClose}
              className="w-full sm:w-auto px-8 font-mono text-xs font-bold uppercase tracking-wider rounded-sm shadow-none bg-primary text-primary-foreground hover:bg-primary/90 h-9"
            >
              <span>[ DONE & CLOSE ]</span>
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 pt-2 font-mono">
          {errorMsg && (
            <div className="p-3.5 rounded-sm bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold uppercase tracking-wide">
              [ ERROR: {errorMsg} ]
            </div>
          )}

          {/* Date Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              1. Select New Date
            </label>
            <Input
              type="date"
              min={getTodayStr()}
              value={selectedDate}
              onChange={handleDateChange}
              className="w-full sm:w-64 font-mono text-sm rounded-sm shadow-none border-border"
              required
            />
          </div>

          {/* Time Slots Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                2. Select New Time Slot {slotsData?.day_of_week ? `[ ${slotsData.day_of_week} ]` : ""}
              </label>
              {slotsData && (
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  [ {slotsData.slots.filter(s => s.is_available).length} AVAILABLE ]
                </span>
              )}
            </div>

            {isLoadingSlots ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2 bg-muted/10 rounded-sm border border-border border-dashed">
                <span className="text-xs font-bold text-muted-foreground">[ CHECKING AVAILABILITY... ]</span>
              </div>
            ) : isErrorSlots ? (
              <div className="p-4 rounded-sm bg-destructive/10 text-destructive text-xs font-bold text-center border border-destructive/20 uppercase">
                [ {slotsError?.message || "COULD NOT LOAD SLOTS FOR THIS DATE"} ]
              </div>
            ) : !slotsData || slotsData.slots.length === 0 ? (
              <div className="py-10 text-center bg-muted/10 rounded-sm border border-border border-dashed text-xs space-y-1">
                <p className="font-bold text-foreground uppercase">[ NO PRACTICE HOURS ON THIS DATE ]</p>
                <p className="text-muted-foreground">The doctor does not have scheduled consultation hours on {selectedDate}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-52 overflow-y-auto p-2 bg-muted/10 rounded-sm border border-border">
                {slotsData.slots.map((slot, idx) => {
                  const isSelected = selectedSlot?.start_time === slot.start_time && selectedSlot?.end_time === slot.end_time;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!slot.is_available}
                      onClick={() => handleSlotSelect(slot)}
                      className={`py-2.5 px-3 rounded-sm border text-xs font-bold flex flex-col items-center justify-center transition-all ${
                        !slot.is_available
                          ? "bg-muted/20 border-border/40 text-muted-foreground/40 cursor-not-allowed line-through"
                          : isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-none"
                          : "bg-card hover:bg-muted/30 text-foreground border-border shadow-none"
                      }`}
                    >
                      <span>{slot.start_time} - {slot.end_time}</span>
                      <span className="text-[10px] font-normal opacity-80 mt-0.5 uppercase">
                        {!slot.is_available ? "[ BOOKED ]" : isSelected ? "[ SELECTED ]" : "[ AVAILABLE ]"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={rescheduleMutation.isPending}
              className="font-mono text-xs font-bold uppercase tracking-wider rounded-sm shadow-none border-border h-9 px-4"
            >
              [ CANCEL ]
            </Button>
            <Button
              type="submit"
              disabled={!selectedSlot || rescheduleMutation.isPending || isLoadingSlots}
              className="font-mono text-xs font-bold uppercase tracking-wider rounded-sm shadow-none bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-6"
            >
              {rescheduleMutation.isPending ? "[ RESCHEDULING... ]" : "[ CONFIRM RESCHEDULE ]"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
