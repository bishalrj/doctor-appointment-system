"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { appointmentService } from "@/services/appointment.service";
import { TimeSlot, AvailableSlotsResponse } from "@/types/appointment";

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  doctorName: string;
  consultationFee: number;
  onSuccess?: () => void;
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  isOpen,
  onClose,
  doctorId,
  doctorName,
  consultationFee,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  
  // Default to tomorrow or today
  const getTodayStr = () => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [reason, setReason] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Query available slots when date changes
  const { data: slotsData, isLoading: isLoadingSlots, isError: isErrorSlots, error: slotsError } = useQuery<AvailableSlotsResponse, Error>({
    queryKey: ["available-slots", doctorId, selectedDate],
    queryFn: () => appointmentService.getAvailableSlots(doctorId, selectedDate),
    enabled: isOpen && !!doctorId && !!selectedDate,
    staleTime: 30 * 1000,
  });

  const bookMutation = useMutation({
    mutationFn: () => {
      if (!selectedSlot) throw new Error("Please select a time slot");
      return appointmentService.bookAppointment({
        doctor_id: doctorId,
        appointment_date: selectedDate,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        reason_for_visit: reason,
      });
    },
    onSuccess: () => {
      setIsSuccess(true);
      setErrorMsg(null);
      queryClient.invalidateQueries({ queryKey: ["available-slots", doctorId] });
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
      if (onSuccess) onSuccess();
    },
    onError: (err: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any)?.response?.data?.message || (err as any)?.message || "Failed to book appointment.";
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
    if (!bookMutation.isPending) {
      setIsSuccess(false);
      setSelectedSlot(null);
      setReason("");
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
    if (!reason.trim() || reason.trim().length < 3) {
      setErrorMsg("Please enter a brief reason for your visit (at least 3 characters).");
      return;
    }
    bookMutation.mutate();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isSuccess ? "Booking Confirmed" : `Book Consultation: Dr. ${doctorName}`}
      description={isSuccess ? "Your appointment request has been submitted successfully." : "Select a convenient date and available time slot."}
      className="max-w-2xl rounded-sm border border-border shadow-none"
    >
      {isSuccess ? (
        <div className="py-8 text-center space-y-6 font-mono">
          <div className="rounded-sm border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-600 dark:text-emerald-400 font-bold text-xs max-w-xs mx-auto">
            [ BOOKING REQUEST LOGGED ]
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-bold font-hanken uppercase text-foreground">Appointment Request Sent</h3>
            <p className="text-sm text-muted-foreground font-mono">
              Your appointment for <span className="font-bold text-foreground">[{selectedDate}]</span> at{" "}
              <span className="font-bold text-foreground">[{selectedSlot?.start_time} - {selectedSlot?.end_time}]</span> has been logged with status <span className="inline-block px-2 py-0.5 rounded-sm bg-amber-500/10 border border-amber-500/20 text-amber-600 font-bold text-xs">[ PENDING ]</span>.
            </p>
            <p className="text-xs text-muted-foreground pt-2">
              Dr. {doctorName} will review and confirm your slot shortly. You can track this in your Patient Portal.
            </p>
          </div>
          <div className="pt-4 flex justify-center gap-4">
            <Button
              onClick={handleClose}
              className="w-full sm:w-auto px-8 font-mono text-xs font-bold uppercase tracking-wider rounded-sm shadow-none bg-primary text-primary-foreground hover:bg-primary/90 h-9"
            >
              <span>[ DONE & RETURN ]</span>
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

          {/* Top Summary Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-sm bg-muted/20 border border-border text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-muted-foreground uppercase">[ CONSULTATION FEE ]:</span>
              <span className="font-bold text-foreground font-hanken text-sm">₹{Number(consultationFee || 0).toLocaleString("en-IN")}</span>
            </div>
            <span className="text-xs text-muted-foreground font-bold uppercase">[ STANDARD 30-MIN SLOT ]</span>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              1. Select Appointment Date
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
                2. Select Time Slot {slotsData?.day_of_week ? `[ ${slotsData.day_of_week} ]` : ""}
              </label>
              {slotsData && (
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  [ {slotsData.slots.filter(s => s.is_available).length} AVAILABLE ]
                </span>
              )}
            </div>

            {isLoadingSlots ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2 bg-muted/10 rounded-sm border border-border border-dashed">
                <span className="text-xs font-bold text-muted-foreground">[ CHECKING DOCTOR AVAILABILITY... ]</span>
              </div>
            ) : isErrorSlots ? (
              <div className="p-4 rounded-sm bg-destructive/10 text-destructive text-xs font-bold text-center border border-destructive/20 uppercase">
                [ {slotsError?.message || "COULD NOT LOAD SLOTS FOR THIS DATE"} ]
              </div>
            ) : !slotsData || slotsData.slots.length === 0 ? (
              <div className="py-10 text-center bg-muted/10 rounded-sm border border-border border-dashed text-xs space-y-1">
                <p className="font-bold text-foreground uppercase">[ NO PRACTICE HOURS ON THIS DATE ]</p>
                <p className="text-muted-foreground">Dr. {doctorName} does not have scheduled consultation hours on {selectedDate}.</p>
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

          {/* Reason for Visit */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              3. Reason for Visit & Symptoms
            </label>
            <Textarea
              rows={3}
              placeholder="[ BRIEFLY DESCRIBE YOUR SYMPTOMS, CONCERN, OR REASON FOR BOOKING... ]"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none text-sm font-mono rounded-sm shadow-none border-border"
              maxLength={1000}
              required
            />
            <span className="text-[11px] text-muted-foreground block text-right font-bold">[{reason.length}/1000 CHARS]</span>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={bookMutation.isPending}
              className="font-mono text-xs font-bold uppercase tracking-wider rounded-sm shadow-none border-border h-9 px-4"
            >
              [ CANCEL ]
            </Button>
            <Button
              type="submit"
              disabled={!selectedSlot || bookMutation.isPending || isLoadingSlots}
              className="font-mono text-xs font-bold uppercase tracking-wider rounded-sm shadow-none bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-6"
            >
              {bookMutation.isPending ? "[ BOOKING... ]" : "[ CONFIRM & BOOK SLOT ]"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
