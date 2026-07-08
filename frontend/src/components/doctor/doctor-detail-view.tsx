"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { doctorService } from "@/services/doctor.service";
import { DoctorDetail, DoctorAvailability } from "@/types/doctor";
import { useAuth } from "@/context/auth-context";
import { AppointmentBookingModal } from "@/components/doctor/appointment-booking-modal";

const DAYS_ORDER = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

interface DoctorDetailViewProps {
  doctorId: string;
  backRoute?: string;
}

export const DoctorDetailView: React.FC<DoctorDetailViewProps> = ({
  doctorId,
  backRoute = "/dashboard/patient/doctors",
}) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const { data: doc, isLoading, isError } = useQuery<DoctorDetail>({
    queryKey: ["doctor-detail", doctorId],
    queryFn: () => doctorService.getDoctorDetail(doctorId),
    staleTime: 5 * 60 * 1000,
  });

  const handleBookClick = () => {
    if (!isAuthenticated) {
      toast.error("Please login as a patient to book an appointment");
      router.push("/login");
      return;
    }
    if (user?.role !== "PATIENT") {
      toast.error("Only registered patients can book medical appointments");
      return;
    }
    setIsBookingOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4 font-mono text-sm text-muted-foreground">
        [ LOADING DOCTOR PROFILE AND SCHEDULE... ]
      </div>
    );
  }

  if (isError || !doc) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <Card className="rounded-sm border border-destructive/40 bg-card text-center py-12 shadow-none">
          <CardContent className="space-y-4">
            <div className="rounded-sm border border-destructive/20 bg-destructive/10 p-3 font-mono text-xs font-bold text-destructive max-w-xs mx-auto">
              [ PROFILE NOT FOUND ]
            </div>
            <h2 className="text-xl font-bold font-hanken uppercase text-foreground">Doctor Profile Not Found</h2>
            <p className="text-sm font-mono text-muted-foreground">
              The requested medical practitioner profile could not be loaded or is no longer active.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push(backRoute)}
              className="font-mono text-xs font-bold uppercase tracking-wider rounded-sm shadow-none border-border"
            >
              <span>&lt;- [ RETURN TO DIRECTORY ]</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sort availabilities by day order and start time
  const sortedAvailabilities = [...(doc.availabilities || [])].sort((a, b) => {
    const dayDiff = DAYS_ORDER.indexOf(a.day_of_week) - DAYS_ORDER.indexOf(b.day_of_week);
    if (dayDiff !== 0) return dayDiff;
    return a.start_time.localeCompare(b.start_time);
  });

  // Group by day for clean rendering
  const groupedSlots = DAYS_ORDER.map((day) => ({
    day,
    slots: sortedAvailabilities.filter((slot) => slot.day_of_week === day && slot.is_available),
  }));

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(backRoute)}
          className="font-mono text-xs font-bold uppercase tracking-wider rounded-sm shadow-none border-border h-8 px-3"
        >
          <span>&lt;- [ BACK TO DIRECTORY ]</span>
        </Button>
        <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
          PROFILE ID: <span className="text-foreground">[{doc.id.slice(0, 8)}]</span>
        </span>
      </div>

      {/* Doctor Hero Card */}
      <div className="rounded-sm border border-border bg-card p-6 md:p-8 text-card-foreground shadow-none flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="h-24 w-24 md:h-28 md:w-28 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-mono font-bold text-3xl shrink-0 overflow-hidden">
            {doc.profile_photo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={doc.profile_photo}
                alt={`Dr. ${doc.first_name?.replace(/^Dr\.\s*|^Dr\s+/i, "")}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              `${doc.first_name?.[0] || ""}${doc.last_name?.[0] || ""}`
            )}
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block px-2.5 py-0.5 rounded-sm bg-primary/10 text-primary font-mono font-bold text-xs border border-primary/20 uppercase tracking-wider">
                [{doc.specialization}]
              </span>
              {doc.is_verified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs border border-emerald-500/20 uppercase tracking-wider">
                  [ VERIFIED SPECIALIST ]
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight font-hanken">
              Dr. {doc.first_name?.replace(/^Dr\.\s*|^Dr\s+/i, "")} {doc.last_name}
            </h1>

            <p className="text-muted-foreground text-sm md:text-base font-mono font-bold">
              {doc.qualification} • {doc.experience_years} YRS CLINICAL EXP
            </p>
          </div>
        </div>

        <div className="rounded-sm border border-border bg-muted/20 p-6 text-center shrink-0 w-full md:w-auto min-w-[200px]">
          <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            Consultation Fee
          </span>
          <div className="text-3xl md:text-4xl font-extrabold font-hanken text-foreground">
            ₹{Number(doc.consultation_fee || 0).toLocaleString("en-IN")}
          </div>
          <span className="text-[11px] font-mono text-muted-foreground block mt-1 uppercase">[ STANDARD VISIT ]</span>
          <Button
            size="sm"
            onClick={handleBookClick}
            className="w-full mt-4 font-mono text-xs font-bold uppercase tracking-wider rounded-sm shadow-none bg-primary text-primary-foreground hover:bg-primary/90 h-9"
          >
            <span>[ + BOOK CONSULTATION ]</span>
          </Button>
        </div>
      </div>

      {/* Practice Details & Location Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-sm border border-border shadow-none bg-card md:col-span-2">
          <CardHeader className="border-b border-border bg-muted/20 pb-4">
            <CardTitle className="font-hanken text-base font-bold uppercase tracking-wider">
              <span>Professional Biography & Philosophy</span>
            </CardTitle>
            <CardDescription className="font-mono text-xs text-muted-foreground">
              Clinical background, medical focus, and expertise
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <div className="p-5 rounded-sm bg-muted/20 border border-border text-foreground whitespace-pre-line leading-relaxed font-sans">
              {doc.bio || "No professional biography has been published by this doctor yet."}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border font-mono text-xs">
              <div>
                <span className="font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  [ HOSPITAL / CLINIC ]
                </span>
                <span className="font-bold text-foreground text-sm">
                  {doc.hospital_clinic || "Private Practice"}
                </span>
              </div>

              <div>
                <span className="font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  [ LANGUAGES SPOKEN ]
                </span>
                <span className="font-bold text-foreground text-sm">
                  {doc.languages || "English"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-sm border border-border shadow-none bg-card">
          <CardHeader className="border-b border-border bg-muted/20 pb-4">
            <CardTitle className="font-hanken text-base font-bold uppercase tracking-wider">
              <span>Practice Location</span>
            </CardTitle>
            <CardDescription className="font-mono text-xs text-muted-foreground">
              Where this practitioner operates
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-sm font-mono">
            <div className="p-4 rounded-sm bg-muted/20 border border-border space-y-2">
              <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                [ ADDRESS ]
              </span>
              <p className="font-bold text-foreground text-base font-hanken">
                {doc.address || "Suite address unlisted"}
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                {[doc.city, doc.state, doc.country].filter(Boolean).join(", ") || "City/State unlisted"}
              </p>
            </div>

            <div className="p-4 rounded-sm bg-muted/10 border border-border space-y-2 text-xs text-muted-foreground">
              <p className="font-bold text-foreground uppercase tracking-wider">[ NOTICE ]</p>
              <p className="font-sans">
                This doctor&apos;s credentials and medical license have been verified against system records. In-person and telemedicine booking are active.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Schedule Section */}
      <Card className="rounded-sm border border-border shadow-none bg-card">
        <CardHeader className="border-b border-border bg-muted/20 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="font-hanken text-base font-bold uppercase tracking-wider">
                <span>Weekly Consultation Schedule & Availability</span>
              </CardTitle>
              <CardDescription className="font-mono text-xs text-muted-foreground">
                Regular recurring consultation hours and appointment slot intervals.
              </CardDescription>
            </div>
            <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-1 rounded-sm bg-primary/10 border border-primary/20 text-primary uppercase tracking-wider self-start sm:self-auto">
              [ {sortedAvailabilities.filter((s) => s.is_available).length} ACTIVE SLOTS ]
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {sortedAvailabilities.filter((s) => s.is_available).length === 0 ? (
            <div className="text-center py-12 space-y-2 font-mono">
              <div className="rounded-sm border border-border bg-muted/20 p-3 text-xs text-muted-foreground max-w-xs mx-auto mb-3">
                [ SCHEDULE UNLISTED ]
              </div>
              <p className="text-base font-bold font-hanken uppercase text-foreground">No Consultation Hours Scheduled</p>
              <p className="text-xs text-muted-foreground">
                This doctor has not published their active weekly appointment availability yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedSlots.map(({ day, slots }) => (
                <div
                  key={day}
                  className={`rounded-sm border border-border p-4 transition-all ${
                    slots.length > 0
                      ? "bg-card"
                      : "bg-muted/10 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
                    <span className="font-mono font-bold text-xs tracking-wider uppercase text-foreground">
                      [ {day} ]
                    </span>
                    <span className="font-mono text-[11px] font-bold text-muted-foreground">
                      {slots.length} {slots.length === 1 ? "SESSION" : "SESSIONS"}
                    </span>
                  </div>

                  {slots.length === 0 ? (
                    <p className="font-mono text-xs text-muted-foreground italic py-2">CLOSED / OFF DAY</p>
                  ) : (
                    <div className="space-y-2.5 font-mono">
                      {slots.map((slot: DoctorAvailability) => (
                        <div
                          key={slot.id}
                          className="p-2.5 rounded-sm bg-muted/20 border border-border space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between font-bold text-foreground">
                            <span className="text-primary">
                              {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                            </span>
                            <span className="bg-background px-2 py-0.5 rounded-sm text-[10px] font-bold border border-border uppercase">
                              {slot.slot_duration}M SLOTS
                            </span>
                          </div>

                          {slot.break_start && slot.break_end && (
                            <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-1">
                              <span className="rounded-sm border border-amber-500/20 bg-amber-500/10 px-1 py-0.2 text-[9px] text-amber-600">
                                [ BREAK ]
                              </span>
                              <span>{slot.break_start.slice(0, 5)} - {slot.break_end.slice(0, 5)}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointment Booking Modal */}
      {doc && (
        <AppointmentBookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          doctorId={doc.id}
          doctorName={`${doc.first_name?.replace(/^Dr\.\s*|^Dr\s+/i, "")} ${doc.last_name}`}
          consultationFee={Number(doc.consultation_fee || 0)}
        />
      )}
    </div>
  );
};
