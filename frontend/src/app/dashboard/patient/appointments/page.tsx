"use client";

import React from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PatientAppointmentsList } from "@/components/appointments/patient-appointments-list";

export default function PatientAppointmentsPage() {
  return (
    <ProtectedRoute allowedRoles={["PATIENT", "ADMIN"]}>
      <div className="max-w-6xl mx-auto pb-12">
        <PatientAppointmentsList />
      </div>
    </ProtectedRoute>
  );
}
