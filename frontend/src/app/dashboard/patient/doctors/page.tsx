"use client";

import React from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DoctorDiscoveryView } from "@/components/doctor/doctor-discovery-view";

export default function PatientDoctorDiscoveryPage() {
  return (
    <ProtectedRoute allowedRoles={["PATIENT", "ADMIN"]}>
      <DoctorDiscoveryView baseRoute="/dashboard/patient/doctors" />
    </ProtectedRoute>
  );
}
