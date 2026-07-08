"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { doctorService } from "@/services/doctor.service";
import { doctorAvailabilitySchema, DoctorAvailabilityFormValues } from "@/lib/validations/doctor";
import { DoctorAvailability } from "@/types/doctor";

const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export default function DoctorAvailabilityPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);

  const { data: availabilities = [], isLoading } = useQuery({
    queryKey: ["doctor-availabilities"],
    queryFn: () => doctorService.listAvailabilities(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DoctorAvailabilityFormValues>({
    resolver: zodResolver(doctorAvailabilitySchema),
    defaultValues: {
      day_of_week: "MONDAY",
      start_time: "09:00",
      end_time: "17:00",
      slot_duration: 30,
      break_start: "13:00",
      break_end: "14:00",
      is_available: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: DoctorAvailabilityFormValues) =>
      doctorService.createAvailability({
        ...data,
        break_start: data.break_start ? data.break_start : undefined,
        break_end: data.break_end ? data.break_end : undefined,
      }),
    onSuccess: () => {
      toast.success("Availability schedule added successfully!");
      reset();
      setIsAdding(false);
      queryClient.invalidateQueries({ queryKey: ["doctor-availabilities"] });
    },
    onError: (error: { response?: { data?: { detail?: string | Record<string, unknown> } } }) => {
      const msg = error.response?.data?.detail || "Failed to add schedule. Overlap or invalid times.";
      toast.error(typeof msg === "string" ? msg : JSON.stringify(msg));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => doctorService.deleteAvailability(id),
    onSuccess: () => {
      toast.success("Availability slot removed.");
      queryClient.invalidateQueries({ queryKey: ["doctor-availabilities"] });
    },
    onError: () => {
      toast.error("Failed to delete availability slot.");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_available }: { id: string; is_available: boolean }) =>
      doctorService.updateAvailability(id, { is_available }),
    onSuccess: () => {
      toast.success("Availability status updated.");
      queryClient.invalidateQueries({ queryKey: ["doctor-availabilities"] });
    },
    onError: () => {
      toast.error("Failed to update status.");
    },
  });

  const onSubmit = (data: DoctorAvailabilityFormValues) => {
    createMutation.mutate(data);
  };

  // Group availabilities by day
  const groupedAvailabilities = DAYS_OF_WEEK.map((day) => ({
    day,
    slots: availabilities.filter((a) => a.day_of_week === day),
  }));

  return (
    <ProtectedRoute allowedRoles={["DOCTOR"]}>
      <div className="space-y-8 max-w-5xl mx-auto pb-12">
        {/* Header */}
        <div className="rounded-sm border border-border bg-card p-6 md:p-8 text-card-foreground shadow-none flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/doctor")}
                className="font-mono text-xs font-bold shadow-none rounded-sm border-border uppercase tracking-wider h-7 px-2"
              >
                <span>&lt;- [ BACK TO CONSOLE ]</span>
              </Button>
              <div className="inline-flex items-center gap-2 rounded-sm bg-primary/10 px-2.5 py-0.5 text-xs font-mono font-bold text-primary border border-primary/20 uppercase tracking-wider">
                <span>[ SCHEDULE CONFIG ]</span>
              </div>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight font-hanken">
              Weekly Schedule & Availability
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl font-mono">
              Configure working hours, appointment durations, and daily break times for patient bookings.
            </p>
          </div>
          <div className="shrink-0">
            <Button
              onClick={() => setIsAdding(!isAdding)}
              variant={isAdding ? "outline" : "default"}
              size="lg"
              className="font-mono font-bold shadow-none rounded-sm border-border uppercase tracking-wider"
            >
              <span>{isAdding ? "[ CANCEL ADDING ]" : "[ + ADD TIME SLOT ]"}</span>
            </Button>
          </div>
        </div>

        {/* Add Slot Form */}
        {isAdding && (
          <Card className="rounded-sm border border-border shadow-none bg-card animate-in fade-in-50 duration-200">
            <CardHeader className="border-b border-border bg-muted/20 pb-4">
              <CardTitle className="font-hanken text-base font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Add Recurring Weekly Slot</span>
                <span className="font-mono text-xs font-normal text-muted-foreground">[ NEW SLOT ]</span>
              </CardTitle>
              <CardDescription className="font-mono text-xs text-muted-foreground">
                Define start time, end time, and optional break periods for a specific day.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                      Day of Week *
                    </label>
                    <Select
                      {...register("day_of_week")}
                      error={errors.day_of_week?.message}
                      className="rounded-sm font-mono text-sm"
                    >
                      {DAYS_OF_WEEK.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                      Start Time (24h) *
                    </label>
                    <Input
                      type="time"
                      {...register("start_time")}
                      error={errors.start_time?.message}
                      className="rounded-sm font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                      End Time (24h) *
                    </label>
                    <Input
                      type="time"
                      {...register("end_time")}
                      error={errors.end_time?.message}
                      className="rounded-sm font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                      Slot Duration (Mins) *
                    </label>
                    <Select
                      {...register("slot_duration")}
                      error={errors.slot_duration?.message}
                      className="rounded-sm font-mono text-sm"
                    >
                      <option value={15}>15 Minutes</option>
                      <option value={20}>20 Minutes</option>
                      <option value={30}>30 Minutes</option>
                      <option value={45}>45 Minutes</option>
                      <option value={60}>60 Minutes (1 Hour)</option>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-2">
                      <span className="rounded-sm border border-border bg-muted/40 px-1 py-0.5 text-[9px] text-foreground">[ OPTIONAL ]</span>
                      <span>Break Start</span>
                    </label>
                    <Input
                      type="time"
                      {...register("break_start")}
                      error={errors.break_start?.message}
                      className="rounded-sm font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-2">
                      <span className="rounded-sm border border-border bg-muted/40 px-1 py-0.5 text-[9px] text-foreground">[ OPTIONAL ]</span>
                      <span>Break End</span>
                    </label>
                    <Input
                      type="time"
                      {...register("break_end")}
                      error={errors.break_end?.message}
                      className="rounded-sm font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAdding(false)}
                    className="font-mono text-xs font-bold uppercase tracking-wider rounded-sm shadow-none"
                  >
                    [ CANCEL ]
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="font-mono text-xs font-bold uppercase tracking-wider rounded-sm shadow-none min-w-[140px]"
                  >
                    {createMutation.isPending ? "[ SAVING... ]" : "[ SAVE SCHEDULE ]"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Schedule List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-lg font-bold tracking-tight font-hanken uppercase text-foreground">
              Configured Weekly Slots
            </h2>
            <div className="rounded-sm border border-border bg-muted/20 px-2 py-0.5 font-mono text-xs font-bold uppercase text-muted-foreground">
              [ TOTAL: {availabilities.length} {availabilities.length === 1 ? "SLOT" : "SLOTS"} ]
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-16 font-mono text-sm text-muted-foreground">
              [ LOADING SCHEDULE DATA... ]
            </div>
          ) : availabilities.length === 0 ? (
            <Card className="rounded-sm border border-border shadow-none bg-card py-12 text-center">
              <CardContent className="space-y-3">
                <div className="rounded-sm border border-border bg-muted/20 p-3 font-mono text-xs text-muted-foreground max-w-xs mx-auto">
                  [ NO SLOTS CONFIGURED ]
                </div>
                <h3 className="text-base font-bold font-hanken uppercase text-foreground">No Availability Configured Yet</h3>
                <p className="text-sm text-muted-foreground font-mono max-w-sm mx-auto">
                  Click the &quot;Add Time Slot&quot; button above to define your weekly working hours and start receiving patient appointments.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAdding(true)}
                  className="mt-2 font-mono text-xs font-bold uppercase tracking-wider rounded-sm shadow-none border-border"
                >
                  <span>[ + ADD YOUR FIRST SLOT ]</span>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {groupedAvailabilities.map(({ day, slots }) => (
                <Card key={day} className={`rounded-sm border border-border shadow-none overflow-hidden transition-all bg-card ${slots.length === 0 ? "opacity-70 bg-muted/10" : ""}`}>
                  <CardHeader className="py-3 px-6 bg-muted/20 border-b border-border flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold font-mono tracking-wider text-foreground">
                      [ {day} ]
                    </CardTitle>
                    <span className="text-xs font-mono font-bold text-muted-foreground">
                      {slots.length} {slots.length === 1 ? "SLOT" : "SLOTS"}
                    </span>
                  </CardHeader>
                  <CardContent className="p-0 divide-y divide-border">
                    {slots.length === 0 ? (
                      <div className="py-4 px-6 font-mono text-xs text-muted-foreground italic">
                        No working hours scheduled for {day.toLowerCase()}.
                      </div>
                    ) : (
                      slots.map((slot: DoctorAvailability) => (
                        <div
                          key={slot.id}
                          className="p-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="rounded-sm border border-border bg-muted/20 px-2 py-1 font-mono text-[10px] font-bold text-foreground">
                              [ SLOT ]
                            </div>
                            <div>
                              <div className="flex items-center gap-2 font-mono font-bold text-sm text-foreground">
                                <span>{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</span>
                                <span className="text-xs font-normal text-muted-foreground border border-border bg-muted/20 px-2 py-0.5 rounded-sm">
                                  {slot.slot_duration} min slots
                                </span>
                              </div>
                              {slot.break_start && slot.break_end ? (
                                <p className="text-xs font-mono text-amber-600 dark:text-amber-400 flex items-center gap-2 mt-1">
                                  <span className="rounded-sm border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-600">
                                    [ BREAK ]
                                  </span>
                                  <span>{slot.break_start.slice(0, 5)} - {slot.break_end.slice(0, 5)}</span>
                                </p>
                              ) : (
                                <p className="text-xs font-mono text-muted-foreground mt-0.5">No break scheduled</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                toggleMutation.mutate({
                                  id: slot.id,
                                  is_available: !slot.is_available,
                                })
                              }
                              disabled={toggleMutation.isPending}
                              className={`font-mono text-xs font-bold uppercase tracking-wider h-8 px-3 rounded-sm shadow-none border ${
                                slot.is_available
                                  ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20"
                                  : "border-border text-muted-foreground bg-muted/20 hover:bg-muted/40"
                              }`}
                            >
                              {slot.is_available ? "[ ACTIVE ]" : "[ PAUSED ]"}
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this time slot?")) {
                                  deleteMutation.mutate(slot.id);
                                }
                              }}
                              disabled={deleteMutation.isPending}
                              className="font-mono text-xs font-bold uppercase tracking-wider rounded-sm shadow-none border-border text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                              title="Delete Slot"
                            >
                              <span>[ DELETE ]</span>
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
