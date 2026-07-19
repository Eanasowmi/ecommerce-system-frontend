"use client";

import { FormEvent, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, Lock, Mail, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth-shell";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accountType = searchParams.get("role") === "seller" ? "seller" : "customer";
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [localError, setLocalError] = useState("");

  const copy = useMemo(() => {
    if (accountType === "seller") {
      return {
        title: "Seller sign in.",
        description: "Use your vendor account to manage products, orders, and inventory.",
        primaryLink: "/auth/login",
        primaryLabel: "Customer login",
      };
    }

    return {
      title: "Customer sign in.",
      description: "Use your buyer account to continue shopping and track orders.",
      primaryLink: "/auth/login?role=seller",
      primaryLabel: "Seller login",
    };
  }, [accountType]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError("");

    if (!formData.email || !formData.password) {
      setLocalError("Please fill in all fields.");
      return;
    }

    const result = await login(formData.email, formData.password);
    if (!result.success) {
      setLocalError(result.error || "Login failed.");
      return;
    }

    const roles = result.roles || [];
    if (roles.includes("SUPER_ADMIN")) {
      router.push("/super-admin");
      return;
    }
    if (roles.includes("ADMIN")) {
      router.push("/admin");
      return;
    }
    if (roles.includes("SELLER")) {
      router.push("/seller");
      return;
    }
    router.push("/customer");
  };

  return (
    <AuthShell
      title={copy.title}
      description={copy.description}
    >
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="rounded-[32px] border border-border/60 bg-card/90 p-8 shadow-2xl shadow-slate-950/10 backdrop-blur-xl"
      >
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">Sign in</p>
          <h2 className="text-3xl font-semibold tracking-tight">Access your account</h2>
          <p className="text-sm text-muted-foreground">Use your business email and password to continue.</p>
        </div>

        <div className="mt-5 flex gap-2 rounded-full border border-border/60 bg-muted/30 p-1 text-sm">
          <Link href="/auth/login" className={`flex-1 rounded-full px-4 py-2 text-center font-medium ${accountType === "customer" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
            Customer login
          </Link>
          <Link href="/auth/login?role=seller" className={`flex-1 rounded-full px-4 py-2 text-center font-medium ${accountType === "seller" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
            Seller login
          </Link>
        </div>

        {(error || localError) ? (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error || localError}</span>
          </div>
        ) : null}

        <div className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                placeholder="you@company.com"
                className="h-12 rounded-2xl pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
                placeholder="••••••••"
                className="h-12 rounded-2xl pl-10"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted-foreground">
              <input type="checkbox" className="h-4 w-4 rounded border-border" />
              Remember me
            </label>
            <Link href="/auth/forgot-password" className="font-medium text-primary transition hover:opacity-80">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" disabled={isLoading} className="h-12 w-full rounded-2xl text-base font-semibold shadow-lg shadow-primary/20">
            {isLoading ? (
              <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Signing in</span>
            ) : (
              "Sign in"
            )}
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here? <Link href="/auth/register" className="font-medium text-primary">Create a customer account</Link>
        </p>
      </motion.form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
