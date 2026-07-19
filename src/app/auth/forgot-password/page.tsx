"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth-shell";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api-client";

const schema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type ForgotPasswordForm = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({ resolver: zodResolver(schema) });

  const router = useRouter();
  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      // Navigate to reset password page with email query param
      router.push(`/auth/reset-password?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      console.error('Forgot password error', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Password recovery."
      description="Request a secure reset link and regain access to your commerce workspace without friction."
      badge="Reset access"
    >
      {!submitted ? (
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-[32px] border border-border/60 bg-card/90 p-8 shadow-2xl shadow-slate-950/10 backdrop-blur-xl"
        >
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary">Forgot password</p>
            <h2 className="text-3xl font-semibold tracking-tight">Send reset link</h2>
            <p className="text-sm text-muted-foreground">We’ll email a secure reset link to your account inbox.</p>
          </div>

          <div className="mt-6 space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" type="email" placeholder="you@company.com" className="h-12 rounded-2xl pl-10" {...register("email")} />
            </div>
            {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
          </div>

          <Button type="submit" disabled={isLoading} className="mt-6 h-12 w-full rounded-2xl text-base font-semibold shadow-lg shadow-primary/20">
            {isLoading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Sending link</span> : "Send reset link"}
          </Button>

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to sign in
            </Link>
          </div>
        </motion.form>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[32px] border border-border/60 bg-card/90 p-8 text-center shadow-2xl shadow-slate-950/10 backdrop-blur-xl"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight">Check your inbox</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">A secure reset link has been sent. It will expire automatically for account safety.</p>
          <Link href="/auth/login" className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20">
            Return to sign in
          </Link>
        </motion.div>
      )}
    </AuthShell>
  );
}
