"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { loginSchema, LoginFormValues } from "@/lib/validations/auth";
import { api } from "@/lib/axios";
import { useAuth } from "@/context/auth-context";
import { AuthTokenResponse } from "@/types/auth";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const response = await api.post<AuthTokenResponse>("/auth/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      setServerError(null);
      login(data);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const msg = error.response?.data?.message || "Invalid email or password. Please try again.";
      setServerError(msg);
      toast.error(msg);
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setServerError(null);
    loginMutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md shadow-none border border-border rounded-sm">
          <CardHeader className="space-y-2 text-center pb-6 border-b border-border/40 bg-muted/20">
            <div className="mx-auto rounded border border-border bg-card px-3 py-1 font-mono text-xs font-bold text-muted-foreground mb-1 w-fit">
              [ AUTH PORTAL ]
            </div>
            <CardTitle className="font-hanken text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
            <CardDescription className="text-xs">
              Sign in to your MediCare Plus Patient, Doctor, or Admin portal
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {serverError && (
              <div className="mb-6 flex items-center gap-2 rounded-sm bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20 font-mono">
                <span className="font-bold">[ ERROR ]</span>
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  error={errors.email?.message}
                  disabled={loginMutation.isPending}
                  className="rounded-sm font-mono text-sm shadow-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                    Password
                  </label>
                  <Link
                    href="#"
                    onClick={(e) => { e.preventDefault(); toast.info("Phase 1 password reset is managed via database admin."); }}
                    className="text-xs text-primary hover:underline font-mono"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  error={errors.password?.message}
                  disabled={loginMutation.isPending}
                  className="rounded-sm font-mono text-sm shadow-none"
                />
              </div>

              <Button
                type="submit"
                variant="medical"
                size="md"
                className="w-full mt-2 font-bold uppercase tracking-wider text-xs shadow-none"
                isLoading={loginMutation.isPending}
              >
                SIGN IN
              </Button>
            </form>

            <div className="mt-6 rounded-sm bg-muted/30 p-3 text-xs text-muted-foreground text-center border border-border font-mono">
              <p className="font-bold text-foreground mb-1">DEMO CREDENTIALS NOTE:</p>
              <p className="text-[11px]">Create a new account via Registration or use pre-seeded test credentials in your database.</p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 border-t border-border/40 pt-6 text-center text-xs text-muted-foreground bg-muted/10">
            <div>
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-bold text-primary hover:underline uppercase tracking-wider ml-1">
                REGISTER NOW
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
