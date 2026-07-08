"use client";

import React from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DoctorAppointmentsList } from "@/components/appointments/doctor-appointments-list";

export default function DoctorAppointmentsPage() {
  return (
    <ProtectedRoute allowedRoles={["DOCTOR", "ADMIN"]}>
      <div className="max-w-6xl mx-auto pb-12">
        <DoctorAppointmentsList />
      </div>
    </ProtectedRoute>
  );
}
