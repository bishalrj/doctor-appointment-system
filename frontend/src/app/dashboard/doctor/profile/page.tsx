"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { doctorService } from "@/services/doctor.service";
import { doctorProfileSchema, DoctorProfileFormValues } from "@/lib/validations/doctor";

export default function DoctorProfileEditorPage() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: profileData, isLoading: isFetching } = useQuery({
    queryKey: ["doctor-profile"],
    queryFn: () => doctorService.getMyProfile(),
    staleTime: 5 * 60 * 1000,
  });

  const currentProfile = profileData || user?.doctor_profile;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<DoctorProfileFormValues>({
    resolver: zodResolver(doctorProfileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      specialization: "",
      qualification: "",
      experience_years: 0,
      consultation_fee: 0,
      bio: "",
      profile_photo: "",
      hospital_clinic: "",
      languages: "",
      address: "",
      city: "",
      state: "",
      country: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (currentProfile) {
      reset({
        first_name: currentProfile.first_name || "",
        last_name: currentProfile.last_name || "",
        specialization: currentProfile.specialization || "",
        qualification: currentProfile.qualification || "",
        experience_years: currentProfile.experience_years || 0,
        consultation_fee: currentProfile.consultation_fee || 0,
        bio: currentProfile.bio || "",
        profile_photo: currentProfile.profile_photo || "",
        hospital_clinic: currentProfile.hospital_clinic || "",
        languages: currentProfile.languages || "",
        address: currentProfile.address || "",
        city: currentProfile.city || "",
        state: currentProfile.state || "",
        country: currentProfile.country || "",
        is_active: currentProfile.is_active ?? true,
      });
    }
  }, [currentProfile, reset]);

  const mutation = useMutation({
    mutationFn: (data: DoctorProfileFormValues) => doctorService.updateMyProfile(data),
    onSuccess: async () => {
      toast.success("Profile updated successfully!");
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ["doctor-profile"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
    onError: (error: { response?: { data?: { detail?: string | Record<string, unknown> } } }) => {
      const msg = error.response?.data?.detail || "Failed to update profile. Please try again.";
      toast.error(typeof msg === "string" ? msg : JSON.stringify(msg));
    },
  });

  const onSubmit = (data: DoctorProfileFormValues) => {
    mutation.mutate(data);
  };

  if (isFetching && !currentProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px] font-mono text-sm text-primary animate-pulse font-bold">
        [ LOADING PROFILE DATA... ]
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["DOCTOR"]}>
      <div className="space-y-8 max-w-5xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/doctor")}
              className="text-muted-foreground font-mono text-xs font-bold -ml-2 mb-1 uppercase tracking-wider hover:text-foreground"
            >
              [ &lt;- BACK TO CONSOLE ]
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-hanken">
                Edit Professional Profile
              </h1>
              <span className="rounded-sm border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                [ PROFILE EDITOR ]
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              Update your clinical qualifications, practice location, and public directory visibility.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={!isDirty || mutation.isPending}
              className="font-mono text-xs font-bold uppercase tracking-wider rounded-sm border-border shadow-none"
            >
              [ DISCARD ]
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={mutation.isPending}
              className="min-w-[140px] font-mono text-xs font-bold uppercase tracking-wider rounded-sm shadow-none"
            >
              {mutation.isPending ? (
                <span className="animate-pulse">[ SAVING... ]</span>
              ) : (
                <span>[ SAVE PROFILE ]</span>
              )}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: Professional Identity */}
          <Card className="rounded-sm border border-border shadow-none bg-card">
            <CardHeader className="border-b border-border bg-muted/20">
              <CardTitle className="font-hanken text-base font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Clinical Identity & Credentials</span>
                <span className="text-xs font-mono text-primary font-bold">[ CREDENTIALS ]</span>
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                Core medical qualifications displayed to patients during discovery.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-sm">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                  First Name *
                </label>
                <Input
                  {...register("first_name")}
                  placeholder="e.g. Sarah"
                  error={errors.first_name?.message}
                  className="rounded-sm border-border font-mono text-sm shadow-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Last Name *
                </label>
                <Input
                  {...register("last_name")}
                  placeholder="e.g. Jenkins"
                  error={errors.last_name?.message}
                  className="rounded-sm border-border font-mono text-sm shadow-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Specialization *
                </label>
                <Input
                  {...register("specialization")}
                  placeholder="e.g. Cardiology, Pediatrics, Dermatology"
                  error={errors.specialization?.message}
                  className="rounded-sm border-border font-mono text-sm shadow-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Qualification *
                </label>
                <Input
                  {...register("qualification")}
                  placeholder="e.g. MBBS, MD (Cardiology), FACC"
                  error={errors.qualification?.message}
                  className="rounded-sm border-border font-mono text-sm shadow-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Experience (Years) *
                </label>
                <Input
                  type="number"
                  {...register("experience_years")}
                  placeholder="0"
                  error={errors.experience_years?.message}
                  className="rounded-sm border-border font-mono text-sm shadow-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Consultation Fee (₹ INR) *
                </label>
                <Input
                  type="number"
                  step="50"
                  {...register("consultation_fee")}
                  placeholder="500"
                  error={errors.consultation_fee?.message}
                  className="rounded-sm border-border font-mono text-sm shadow-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Practice & Location */}
          <Card className="rounded-sm border border-border shadow-none bg-card">
            <CardHeader className="border-b border-border bg-muted/20">
              <CardTitle className="font-hanken text-base font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Practice & Location Details</span>
                <span className="text-xs font-mono text-purple-600 font-bold">[ LOCATION ]</span>
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                Where patients can visit or associate your clinical practice.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-sm">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Hospital / Clinic Name
                </label>
                <Input
                  {...register("hospital_clinic")}
                  placeholder="e.g. Manipal Hospital / Private Practice"
                  error={errors.hospital_clinic?.message}
                  className="rounded-sm border-border font-mono text-sm shadow-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Languages Spoken
                </label>
                <Input
                  {...register("languages")}
                  placeholder="e.g. English, Hindi, Kannada (comma separated)"
                  error={errors.languages?.message}
                  className="rounded-sm border-border font-mono text-sm shadow-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Street Address / Clinic Suite
                </label>
                <Input
                  {...register("address")}
                  placeholder="e.g. Suite 402, Apollo Health City"
                  error={errors.address?.message}
                  className="rounded-sm border-border font-mono text-sm shadow-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                  City
                </label>
                <Input
                  {...register("city")}
                  placeholder="e.g. Bengaluru"
                  error={errors.city?.message}
                  className="rounded-sm border-border font-mono text-sm shadow-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                  State / Province
                </label>
                <Input
                  {...register("state")}
                  placeholder="e.g. Karnataka"
                  error={errors.state?.message}
                  className="rounded-sm border-border font-mono text-sm shadow-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Country
                </label>
                <Input
                  {...register("country")}
                  placeholder="e.g. India"
                  error={errors.country?.message}
                  className="rounded-sm border-border font-mono text-sm shadow-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Biography & Visibility */}
          <Card className="rounded-sm border border-border shadow-none bg-card">
            <CardHeader className="border-b border-border bg-muted/20">
              <CardTitle className="font-hanken text-base font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Biography & Public Visibility</span>
                <span className="text-xs font-mono text-amber-600 font-bold">[ BIOGRAPHY ]</span>
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                Provide background information and manage your directory listing status.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6 font-mono text-sm">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Profile Photo URL (Optional)
                </label>
                <Input
                  {...register("profile_photo")}
                  placeholder="https://example.com/photo.jpg"
                  error={errors.profile_photo?.message}
                  className="rounded-sm border-border font-mono text-sm shadow-none"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Enter a direct link to your professional headshot image.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Professional Bio
                </label>
                <Textarea
                  {...register("bio")}
                  placeholder="Describe your medical philosophy, clinical focus areas, research achievements, and patient care approach..."
                  rows={4}
                  error={errors.bio?.message}
                  className="rounded-sm border-border font-mono text-sm shadow-none"
                />
              </div>

              <div className="p-4 rounded-sm border border-border bg-muted/20 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-foreground font-hanken uppercase tracking-wider">Active Directory Status</h4>
                  <p className="text-xs text-muted-foreground font-mono">
                    When active, your profile is searchable and visible to patients looking for doctors.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("is_active")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted-foreground/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/doctor")}
              className="font-mono text-xs font-bold uppercase tracking-wider rounded-sm border-border shadow-none"
            >
              [ CANCEL ]
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="min-w-[160px] font-mono text-xs font-bold uppercase tracking-wider rounded-sm shadow-none"
            >
              {mutation.isPending ? (
                <span className="animate-pulse">[ SAVING... ]</span>
              ) : (
                <span>[ SAVE PROFILE ]</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
