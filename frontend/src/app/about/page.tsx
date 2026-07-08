"use client";

import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 md:px-8 py-12 md:py-20 max-w-5xl space-y-20">
        {/* Page Title / Header */}
        <header className="border-b border-border pb-10 space-y-4">
          <div className="font-mono text-xs font-bold text-primary uppercase tracking-wider">
            [ UNIVERSITY PROJECT DOCUMENTATION ]
          </div>
          <h1 className="font-hanken text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            About MediCare Plus
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed">
            A full-stack Doctor Appointment System developed as a university project to simplify doctor discovery and appointment management.
          </p>
        </header>

        {/* SECTION 1: Project Overview */}
        <section className="space-y-6">
          <div className="border-l-2 border-primary pl-4">
            <h2 className="font-hanken text-2xl font-bold tracking-tight text-foreground">
              Project Overview
            </h2>
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              [ SYSTEM BACKGROUND & PURPOSE ]
            </span>
          </div>

          <div className="space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed max-w-4xl">
            <p>
              MediCare Plus is a modern, web-based healthcare scheduling platform engineered to bridge the gap between medical practitioners and patients. Built from the ground up with clean architectural patterns, the system offers a streamlined interface for finding doctors, scheduling appointments, and managing clinical availability without administrative friction.
            </p>
            <p>
              The project was developed to address the inefficiencies inherent in traditional scheduling workflows, such as manual telephone bookings, fragmented patient records, and lack of real-time visibility into doctor availability. By digitizing the appointment lifecycle, MediCare Plus eliminates redundant scheduling coordination and reduces patient wait times.
            </p>
            <p>
              The platform serves three primary user groups: patients seeking medical consultations, doctors managing their clinical schedules, and administrative personnel overseeing system operations and provider verification. Each role operates within an isolated, secure workspace tailored to their specific operational requirements.
            </p>
          </div>
        </section>

        {/* SECTION 2: Project Objectives */}
        <section className="space-y-6">
          <div className="border-l-2 border-primary pl-4">
            <h2 className="font-hanken text-2xl font-bold tracking-tight text-foreground">
              Project Objectives
            </h2>
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              [ CORE ENGINEERING & UX GOALS ]
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            <div className="p-6 rounded-sm border border-border bg-card/40 space-y-2">
              <h3 className="font-hanken font-bold text-base text-foreground">Simplify Appointment Booking</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Provide an intuitive, low-friction booking flow allowing patients to schedule consultations in under a minute.
              </p>
            </div>

            <div className="p-6 rounded-sm border border-border bg-card/40 space-y-2">
              <h3 className="font-hanken font-bold text-base text-foreground">Reduce Manual Scheduling</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Automate time slot generation and availability tracking to eliminate scheduling conflicts and double bookings.
              </p>
            </div>

            <div className="p-6 rounded-sm border border-border bg-card/40 space-y-2">
              <h3 className="font-hanken font-bold text-base text-foreground">Improve Doctor Discovery</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enable granular filtering by medical specialization, consultation fee, and clinical location across verified providers.
              </p>
            </div>

            <div className="p-6 rounded-sm border border-border bg-card/40 space-y-2">
              <h3 className="font-hanken font-bold text-base text-foreground">Secure Authentication</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Implement robust, stateless JSON Web Token (JWT) authentication with automated token rotation and bcrypt password hashing.
              </p>
            </div>

            <div className="p-6 rounded-sm border border-border bg-card/40 space-y-2">
              <h3 className="font-hanken font-bold text-base text-foreground">Role-Based Access</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enforce strict privilege separation across Patient, Doctor, and Admin portals at both routing and API endpoints.
              </p>
            </div>

            <div className="p-6 rounded-sm border border-border bg-card/40 space-y-2">
              <h3 className="font-hanken font-bold text-base text-foreground">Easy Appointment Management</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Empower providers and patients with real-time status updates, cancellation workflows, and rescheduling capabilities.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: Key Features */}
        <section className="space-y-6">
          <div className="border-l-2 border-primary pl-4">
            <h2 className="font-hanken text-2xl font-bold tracking-tight text-foreground">
              Key Features
            </h2>
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              [ IMPLEMENTED FUNCTIONALITY BY ROLE ]
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
            {/* Patient Features */}
            <div className="border border-border rounded-sm p-6 bg-card/20 space-y-4">
              <div className="border-b border-border pb-3">
                <span className="font-mono text-xs font-bold text-primary uppercase tracking-wider">[ 01. PATIENT ]</span>
                <h3 className="font-hanken text-lg font-bold text-foreground mt-1">Patient Portal</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-muted-foreground font-mono">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Register & Profile Setup</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Browse & Filter Doctors</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Book Appointments</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Manage Appointments</span>
                </li>
              </ul>
            </div>

            {/* Doctor Features */}
            <div className="border border-border rounded-sm p-6 bg-card/20 space-y-4">
              <div className="border-b border-border pb-3">
                <span className="font-mono text-xs font-bold text-primary uppercase tracking-wider">[ 02. DOCTOR ]</span>
                <h3 className="font-hanken text-lg font-bold text-foreground mt-1">Doctor Portal</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-muted-foreground font-mono">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Manage Profile & Credentials</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Set Weekly Availability</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Accept or Reject Appointments</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>View Clinical Schedule</span>
                </li>
              </ul>
            </div>

            {/* Admin Features */}
            <div className="border border-border rounded-sm p-6 bg-card/20 space-y-4">
              <div className="border-b border-border pb-3">
                <span className="font-mono text-xs font-bold text-primary uppercase tracking-wider">[ 03. ADMIN ]</span>
                <h3 className="font-hanken text-lg font-bold text-foreground mt-1">Admin Portal</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-muted-foreground font-mono">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Manage Doctors & Verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Manage Patient Records</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Monitor System Appointments</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>System Analytics Dashboard</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 4: How the System Works */}
        <section className="space-y-6">
          <div className="border-l-2 border-primary pl-4">
            <h2 className="font-hanken text-2xl font-bold tracking-tight text-foreground">
              How the System Works
            </h2>
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              [ END-TO-END APPOINTMENT LIFECYCLE ]
            </span>
          </div>

          <div className="py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
              <div className="w-full md:w-auto p-4 rounded-sm border border-border bg-card text-center font-bold">
                01. Register
              </div>
              <div className="text-muted-foreground font-bold md:rotate-[-90deg] text-base">↓</div>
              <div className="w-full md:w-auto p-4 rounded-sm border border-border bg-card text-center font-bold">
                02. Login
              </div>
              <div className="text-muted-foreground font-bold md:rotate-[-90deg] text-base">↓</div>
              <div className="w-full md:w-auto p-4 rounded-sm border border-border bg-card text-center font-bold">
                03. Browse Doctors
              </div>
              <div className="text-muted-foreground font-bold md:rotate-[-90deg] text-base">↓</div>
              <div className="w-full md:w-auto p-4 rounded-sm border border-border bg-card text-center font-bold">
                04. Book Appointment
              </div>
              <div className="text-muted-foreground font-bold md:rotate-[-90deg] text-base">↓</div>
              <div className="w-full md:w-auto p-4 rounded-sm border border-border bg-card text-center font-bold">
                05. Doctor Approval
              </div>
              <div className="text-muted-foreground font-bold md:rotate-[-90deg] text-base">↓</div>
              <div className="w-full md:w-auto p-4 rounded-sm border border-border bg-card text-center font-bold border-primary/50 text-primary">
                06. Appointment Completed
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: Technology Overview */}
        <section className="space-y-6">
          <div className="border-l-2 border-primary pl-4">
            <h2 className="font-hanken text-2xl font-bold tracking-tight text-foreground">
              Technology Overview
            </h2>
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              [ TECHNICAL ARCHITECTURE & STACK ]
            </span>
          </div>

          <div className="border border-border rounded-sm overflow-hidden text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
              <div className="p-6 space-y-4">
                <div className="font-mono text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-2">
                  Frontend Architecture
                </div>
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Framework:</dt>
                    <dd className="font-mono font-bold text-foreground">Next.js 15 (App Router)</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Language:</dt>
                    <dd className="font-mono font-bold text-foreground">TypeScript</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Styling:</dt>
                    <dd className="font-mono font-bold text-foreground">Tailwind CSS</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">State & Data Fetching:</dt>
                    <dd className="font-mono font-bold text-foreground">TanStack Query v5 / Axios</dd>
                  </div>
                </dl>
              </div>

              <div className="p-6 space-y-4">
                <div className="font-mono text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-2">
                  Backend & Database
                </div>
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">REST API Framework:</dt>
                    <dd className="font-mono font-bold text-foreground">Python / FastAPI</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">ORM & Schema:</dt>
                    <dd className="font-mono font-bold text-foreground">SQLAlchemy 2 / Pydantic v2</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Database Engine:</dt>
                    <dd className="font-mono font-bold text-foreground">PostgreSQL</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Authentication:</dt>
                    <dd className="font-mono font-bold text-foreground">Stateless JWT / Bcrypt</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: Future Scope */}
        <section className="space-y-6">
          <div className="border-l-2 border-primary pl-4">
            <h2 className="font-hanken text-2xl font-bold tracking-tight text-foreground">
              Future Scope
            </h2>
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              [ PLANNED SYSTEM ENHANCEMENTS ]
            </span>
          </div>

          <div className="p-6 rounded-sm border border-border bg-card/20 space-y-4">
            <p className="text-xs text-muted-foreground">
              The following features are outlined for future development phases to further expand the capabilities of the platform:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono text-foreground">
              <li className="flex items-center gap-2">
                <span className="text-primary font-bold">+</span>
                <span>Online video consultation integration</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary font-bold">+</span>
                <span>Payment gateway for instant fee settlement</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary font-bold">+</span>
                <span>Automated email and SMS booking notifications</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary font-bold">+</span>
                <span>Dedicated mobile application for iOS and Android</span>
              </li>
              <li className="flex items-center gap-2 md:col-span-2">
                <span className="text-primary font-bold">+</span>
                <span>AI-assisted symptom analysis and appointment recommendations</span>
              </li>
            </ul>
          </div>
        </section>

        {/* SECTION 7: Project Specifications & Team */}
        <section className="space-y-6 pt-6 border-t border-border">
          <div className="border border-border rounded-sm p-8 bg-muted/20 space-y-6 font-mono text-xs">
            <div className="border-b border-border pb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <span className="text-muted-foreground">PROJECT NAME: </span>
                <span className="font-bold text-foreground text-sm">MedicarePlus</span>
              </div>
              <div className="text-[11px] text-primary font-bold">
                [ ACADEMIC SUBMISSION ]
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-muted-foreground mb-1">DEVELOPED BY:</div>
                <div className="font-bold text-foreground leading-relaxed text-sm">
                  BishalRaj Kakoti, Chandamuri Kasi Reddy, CM Shivali, DS Nandhushri, Bhupalam Gagana Sindhu
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/60">
                <div>
                  <div className="text-muted-foreground mb-1">UNIVERSITY:</div>
                  <div className="font-bold text-foreground">
                    JAIN (Deemed-to-be University)
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">DEPARTMENT:</div>
                  <div className="font-bold text-foreground">
                    Computer Science Engineer (Data Science)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
