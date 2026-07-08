"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { DoctorDetailView } from "@/components/doctor/doctor-detail-view";

export default function PublicDoctorDetailPage() {
  const params = useParams();
  const doctorId = params?.id as string;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-8 px-4 md:px-8">
        <DoctorDetailView doctorId={doctorId} backRoute="/doctors" />
      </main>
      <Footer />
    </div>
  );
}
