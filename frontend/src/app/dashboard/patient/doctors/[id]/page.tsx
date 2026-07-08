"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DoctorDetailView } from "@/components/doctor/doctor-detail-view";

export default function PatientDoctorDetailPage() {
  const params = useParams();
  const doctorId = params?.id as string;

  return (
    <ProtectedRoute allowedRoles={["PATIENT", "ADMIN"]}>
      <DoctorDetailView doctorId={doctorId} backRoute="/dashboard/patient/doctors" />
    </ProtectedRoute>
  );
}
