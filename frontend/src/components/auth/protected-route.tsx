"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { UserRole } from "@/types/auth";
import { Spinner } from "@/components/ui/loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.replace("/login");
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate role dashboard if unauthorized for this route
        if (user.role === "ADMIN") router.replace("/dashboard/admin");
        else if (user.role === "DOCTOR") router.replace("/dashboard/doctor");
        else router.replace("/dashboard/patient");
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center flex-col gap-3">
        <Spinner size={36} />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Verifying security credentials...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
};
