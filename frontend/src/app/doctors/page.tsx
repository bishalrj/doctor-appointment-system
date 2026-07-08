"use client";

import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { DoctorDiscoveryView } from "@/components/doctor/doctor-discovery-view";

export default function PublicDoctorDiscoveryPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-8 px-4 md:px-8">
        <DoctorDiscoveryView baseRoute="/doctors" />
      </main>
      <Footer />
    </div>
  );
}
