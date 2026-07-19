"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, KeyRound, Lock, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth-shell";
import { authApi } from "@/lib/api-client";
import { useSearchParams } from "next/navigation";

const schema = z.object({
  otpCode: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string().min(6, "Confirm your password."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const email = decodeURIComponent(searchParams.get("email") ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: { otpCode: string; password: string }) => {
    setIsLoading(true);
    try {
      await authApi.resetPassword({ email, otpCode: data.otpCode, newPassword: data.password });
      setSubmitted(true);
    } catch (err) {
      console.error('Reset password error', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-[32px] border border-border/60 bg-card/90 p-8 text-center shadow-2xl shadow-slate-950/10 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-3xl font-semibold tracking-tight">Password updated</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">You can now sign in with your new password.</p>
        <Link href="/auth/login" className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20">
          Go to sign in
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-[32px] border border-border/60 bg-card/90 p-8 shadow-2xl shadow-slate-950/10 backdrop-blur-xl"
    >
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Reset password</p>
        <h2 className="text-3xl font-semibold tracking-tight">Choose a new password</h2>
        <p className="text-sm text-muted-foreground">Use a password you have not used before.</p>
      </div>

      <div className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="otpCode">OTP Code</Label>
          <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="otpCode" placeholder="Enter OTP" className="h-12 rounded-2xl pl-10" {...register("otpCode")} />
            </div>
            {errors.otpCode ? <p className="text-xs text-destructive">{errors.otpCode.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="password" type="password" placeholder="Enter new password" className="h-12 rounded-2xl pl-10" {...register("password")} />
          </div>
          {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="confirmPassword" type="password" placeholder="Confirm password" className="h-12 rounded-2xl pl-10" {...register("confirmPassword")} />
          </div>
          {errors.confirmPassword ? <p className="text-xs text-destructive">{errors.confirmPassword.message}</p> : null}
        </div>

        <Button type="submit" disabled={isLoading} className="h-12 w-full rounded-2xl text-base font-semibold shadow-lg shadow-primary/20">
          {isLoading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Updating password</span> : "Update password"}
        </Button>
      </div>

      <div className="mt-6 text-center">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>
    </motion.form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Reset your password."
      description="Set a new secure password and return to your workspace with uninterrupted access."
      badge="Account recovery"
    >
      <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
