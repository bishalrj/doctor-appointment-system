"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const patientLinks = [
    { name: "Overview", href: "/dashboard/patient", disabled: false },
    { name: "Find a Doctor", href: "/dashboard/patient/doctors", disabled: false },
    { name: "My Appointments", href: "/dashboard/patient/appointments", disabled: false },
    { name: "Medical Records", href: "#", disabled: true },
  ];

  const doctorLinks = [
    { name: "Doctor Overview", href: "/dashboard/doctor", disabled: false },
    { name: "Edit Profile", href: "/dashboard/doctor/profile", disabled: false },
    { name: "Schedule & Slots", href: "/dashboard/doctor/availability", disabled: false },
    { name: "Patient Consultations", href: "/dashboard/doctor/appointments", disabled: false },
  ];

  const adminLinks = [
    { name: "System Overview", href: "/dashboard/admin", disabled: false },
    { name: "Doctor Management", href: "/dashboard/admin/doctors", disabled: false },
    { name: "Patient Management", href: "/dashboard/admin/patients", disabled: false },
    { name: "All Appointments", href: "/dashboard/admin/appointments", disabled: false },
  ];

  const links =
    user.role === "ADMIN"
      ? adminLinks
      : user.role === "DOCTOR"
      ? doctorLinks
      : patientLinks;

  return (
    <aside className="w-64 border-r border-border bg-card shrink-0 hidden md:flex flex-col justify-between p-6">
      <div className="space-y-6">
        <div>
          <div className="mb-6 pb-4 border-b border-border">
            <h3 className="font-hanken font-bold text-base tracking-tight text-foreground uppercase">
              {user.role === "ADMIN"
                ? "Admin Portal"
                : user.role === "DOCTOR"
                ? "Doctor Console"
                : "Patient Dashboard"}
            </h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">
              [STATUS: OPERATIONAL]
            </p>
          </div>

          <div className="space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.name}
                  href={link.disabled ? "#" : link.href}
                  className={cn(
                    "block border-l-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all",
                    isActive
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    link.disabled && "opacity-40 cursor-not-allowed"
                  )}
                  onClick={(e) => {
                    if (link.disabled) e.preventDefault();
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-4 text-[11px] text-muted-foreground space-y-1 font-mono">
        <p className="font-bold text-foreground">SYSTEM METADATA</p>
        <p>ROLE: {user.role}</p>
        <p>AUTH: JWT SECURED</p>
      </div>
    </aside>
  );
};
