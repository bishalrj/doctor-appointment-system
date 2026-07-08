"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  patientRegisterSchema,
  PatientRegisterFormValues,
  doctorRegisterSchema,
  DoctorRegisterFormValues,
} from "@/lib/validations/auth";
import { api } from "@/lib/axios";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const [roleTab, setRoleTab] = useState<"PATIENT" | "DOCTOR">("PATIENT");
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  // Patient Form
  const patientForm = useForm<PatientRegisterFormValues>({
    resolver: zodResolver(patientRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      date_of_birth: "",
      gender: "Male",
      blood_group: "O+",
      address: "",
      emergency_contact: "",
    },
  });

  // Doctor Form
  const doctorForm = useForm<DoctorRegisterFormValues>({
    resolver: zodResolver(doctorRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      first_name: "",
      last_name: "",
      specialization: "",
      license_number: "",
      qualification: "",
      experience_years: 0,
      consultation_fee: 500,
      bio: "",
    },
  });

  const registerPatientMutation = useMutation({
    mutationFn: async (data: PatientRegisterFormValues) => {
      const payload = {
        email: data.email,
        password: data.password,
        profile: {
          first_name: data.first_name,
          last_name: data.last_name,
          phone_number: data.phone_number,
          date_of_birth: data.date_of_birth || null,
          gender: data.gender,
          blood_group: data.blood_group || null,
          address: data.address,
          emergency_contact: data.emergency_contact,
        },
      };
      const res = await api.post("/auth/register/patient", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Patient account registered successfully! Please log in.");
      router.push("/login");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const msg = error.response?.data?.message || "Registration failed. Please check your inputs.";
      setServerError(msg);
      toast.error(msg);
    },
  });

  const registerDoctorMutation = useMutation({
    mutationFn: async (data: DoctorRegisterFormValues) => {
      const payload = {
        email: data.email,
        password: data.password,
        profile: {
          first_name: data.first_name,
          last_name: data.last_name,
          specialization: data.specialization,
          license_number: data.license_number,
          qualification: data.qualification,
          experience_years: data.experience_years,
          consultation_fee: data.consultation_fee,
          bio: data.bio,
        },
      };
      const res = await api.post("/auth/register/doctor", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Doctor account registered successfully! Please log in.");
      router.push("/login");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const msg = error.response?.data?.message || "Registration failed. License or email may already exist.";
      setServerError(msg);
      toast.error(msg);
    },
  });

  const onPatientSubmit = (data: PatientRegisterFormValues) => {
    setServerError(null);
    registerPatientMutation.mutate(data);
  };

  const onDoctorSubmit = (data: DoctorRegisterFormValues) => {
    setServerError(null);
    registerDoctorMutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 md:p-8 py-12">
        <Card className="w-full max-w-2xl shadow-none border border-border rounded-sm">
          <CardHeader className="text-center pb-6 border-b border-border/40 bg-muted/20">
            <div className="mx-auto rounded border border-border bg-card px-3 py-1 font-mono text-xs font-bold text-muted-foreground mb-1 w-fit">
              [ REGISTRATION ]
            </div>
            <CardTitle className="font-hanken text-2xl font-bold tracking-tight">Create Account</CardTitle>
            <CardDescription className="text-xs">
              Join MediCare Plus as a Patient or Healthcare Provider
            </CardDescription>

            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-muted/50 rounded-sm mt-6 border border-border font-mono">
              <button
                type="button"
                onClick={() => { setRoleTab("PATIENT"); setServerError(null); }}
                className={cn(
                  "flex items-center justify-center py-2 px-4 rounded-sm text-xs font-bold uppercase tracking-wider transition-all",
                  roleTab === "PATIENT"
                    ? "bg-background text-foreground border border-border shadow-none"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>PATIENT PORTAL</span>
              </button>
              <button
                type="button"
                onClick={() => { setRoleTab("DOCTOR"); setServerError(null); }}
                className={cn(
                  "flex items-center justify-center py-2 px-4 rounded-sm text-xs font-bold uppercase tracking-wider transition-all",
                  roleTab === "DOCTOR"
                    ? "bg-background text-foreground border border-border shadow-none"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>DOCTOR CONSOLE</span>
              </button>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {serverError && (
              <div className="mb-6 flex items-center gap-2 rounded-sm bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20 font-mono">
                <span className="font-bold">[ ERROR ]</span>
                <span>{serverError}</span>
              </div>
            )}

            {/* Patient Registration Form */}
            {roleTab === "PATIENT" && (
              <form onSubmit={patientForm.handleSubmit(onPatientSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">First Name *</label>
                    <Input placeholder="John" {...patientForm.register("first_name")} error={patientForm.formState.errors.first_name?.message} className="rounded-sm font-mono text-sm shadow-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">Last Name *</label>
                    <Input placeholder="Doe" {...patientForm.register("last_name")} error={patientForm.formState.errors.last_name?.message} className="rounded-sm font-mono text-sm shadow-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">Email Address *</label>
                    <Input type="email" placeholder="john.doe@example.com" {...patientForm.register("email")} error={patientForm.formState.errors.email?.message} className="rounded-sm font-mono text-sm shadow-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">Phone Number *</label>
                    <Input placeholder="+1 (555) 019-2834" {...patientForm.register("phone_number")} error={patientForm.formState.errors.phone_number?.message} className="rounded-sm font-mono text-sm shadow-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">Date of Birth *</label>
                    <Input type="date" {...patientForm.register("date_of_birth")} error={patientForm.formState.errors.date_of_birth?.message} className="rounded-sm font-mono text-sm shadow-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">Gender *</label>
                    <select
                      {...patientForm.register("gender")}
                      className="flex h-9 w-full rounded-sm border border-input bg-background px-3 py-1.5 text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary shadow-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">Blood Group</label>
                    <select
                      {...patientForm.register("blood_group")}
                      className="flex h-9 w-full rounded-sm border border-input bg-background px-3 py-1.5 text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary shadow-none"
                    >
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">Full Residential Address *</label>
                  <Input placeholder="123 Health Ave, Apt 4B, New York, NY" {...patientForm.register("address")} error={patientForm.formState.errors.address?.message} className="rounded-sm font-mono text-sm shadow-none" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">Emergency Contact (Name & Phone) *</label>
                  <Input placeholder="Jane Doe (+1 555-019-9999)" {...patientForm.register("emergency_contact")} error={patientForm.formState.errors.emergency_contact?.message} className="rounded-sm font-mono text-sm shadow-none" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">Password * (Min 8 chars)</label>
                    <Input type="password" placeholder="••••••••" {...patientForm.register("password")} error={patientForm.formState.errors.password?.message} className="rounded-sm font-mono text-sm shadow-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">Confirm Password *</label>
                    <Input type="password" placeholder="••••••••" {...patientForm.register("confirmPassword")} error={patientForm.formState.errors.confirmPassword?.message} className="rounded-sm font-mono text-sm shadow-none" />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="medical"
                  size="md"
                  className="w-full mt-4 font-bold uppercase tracking-wider text-xs shadow-none"
                  isLoading={registerPatientMutation.isPending}
                >
                  REGISTER PATIENT ACCOUNT
                </Button>
              </form>
            )}

            {/* Doctor Registration Form */}
            {roleTab === "DOCTOR" && (
              <form onSubmit={doctorForm.handleSubmit(onDoctorSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">First Name *</label>
                    <Input placeholder="Sarah" {...doctorForm.register("first_name")} error={doctorForm.formState.errors.first_name?.message} className="rounded-sm font-mono text-sm shadow-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">Last Name *</label>
                    <Input placeholder="Jenkins, MD" {...doctorForm.register("last_name")} error={doctorForm.formState.errors.last_name?.message} className="rounded-sm font-mono text-sm shadow-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">Email Address *</label>
                    <Input type="email" placeholder="dr.sarah@medicare.org" {...doctorForm.register("email")} error={doctorForm.formState.errors.email?.message} className="rounded-sm font-mono text-sm shadow-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">Medical License Number *</label>
                    <Input placeholder="MED-NY-88901" {...doctorForm.register("license_number")} error={doctorForm.formState.errors.license_number?.message} className="rounded-sm font-mono text-sm shadow-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">Specialization *</label>
                    <Input placeholder="Cardiology" {...doctorForm.register("specialization")} error={doctorForm.formState.errors.specialization?.message} className="rounded-sm font-mono text-sm shadow-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">Qualification *</label>
                    <Input placeholder="MBBS, MD (Cardio)" {...doctorForm.register("qualification")} error={doctorForm.formState.errors.qualification?.message} className="rounded-sm font-mono text-sm shadow-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">Experience (Years) *</label>
                    <Input type="number" {...doctorForm.register("experience_years")} error={doctorForm.formState.errors.experience_years?.message} className="rounded-sm font-mono text-sm shadow-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">Consultation Fee (₹ INR) *</label>
                  <Input type="number" step="50" {...doctorForm.register("consultation_fee")} error={doctorForm.formState.errors.consultation_fee?.message} className="rounded-sm font-mono text-sm shadow-none" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">Professional Bio & Expertise *</label>
                  <textarea
                    rows={3}
                    placeholder="Senior Board-Certified Cardiologist with 12+ years of experience in non-invasive clinical cardiology..."
                    {...doctorForm.register("bio")}
                    className="flex w-full rounded-sm border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary shadow-none"
                  />
                  {doctorForm.formState.errors.bio?.message && (
                    <p className="mt-1 text-xs text-destructive font-mono">{doctorForm.formState.errors.bio.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">Password * (Min 8 chars)</label>
                    <Input type="password" placeholder="••••••••" {...doctorForm.register("password")} error={doctorForm.formState.errors.password?.message} className="rounded-sm font-mono text-sm shadow-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">Confirm Password *</label>
                    <Input type="password" placeholder="••••••••" {...doctorForm.register("confirmPassword")} error={doctorForm.formState.errors.confirmPassword?.message} className="rounded-sm font-mono text-sm shadow-none" />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="medical"
                  size="md"
                  className="w-full mt-4 font-bold uppercase tracking-wider text-xs shadow-none"
                  isLoading={registerDoctorMutation.isPending}
                >
                  SUBMIT DOCTOR REGISTRATION
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 border-t border-border/40 pt-6 text-center text-xs text-muted-foreground bg-muted/10">
            <div>
              Already registered?{" "}
              <Link href="/login" className="font-bold text-primary hover:underline uppercase tracking-wider ml-1">
                SIGN IN HERE
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
