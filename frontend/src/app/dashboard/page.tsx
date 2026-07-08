"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Spinner } from "@/components/ui/loader";

export default function DashboardRootPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role === "ADMIN") {
        router.replace("/dashboard/admin");
      } else if (user.role === "DOCTOR") {
        router.replace("/dashboard/doctor");
      } else {
        router.replace("/dashboard/patient");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex h-[70vh] w-full items-center justify-center flex-col gap-3">
      <Spinner size={36} />
      <p className="text-sm font-medium text-muted-foreground">
        Routing to your role workspace...
      </p>
    </div>
  );
}
