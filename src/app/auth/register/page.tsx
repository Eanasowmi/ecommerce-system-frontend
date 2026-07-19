"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, Lock, Mail, Loader2, User } from "lucide-react";
import { useAuth } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth-shell";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    accountType: "customer" as "customer" | "seller",
  });
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError("");

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setLocalError("Please fill in all fields.");
      return;
    }

    if (formData.password.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }

    const result = await register(formData.email, formData.password, formData.firstName, formData.lastName, formData.accountType);
    if (!result.success) {
      setLocalError(result.error || "Registration failed.");
      return;
    }

    router.push(formData.accountType === "seller" ? "/seller" : "/customer");
  };

  return (
    <AuthShell
      title="Create your account."
      description="Join a marketplace that feels polished for customers, vendors, and internal teams alike."
      badge="Start selling or buying"
    >
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="rounded-[32px] border border-border/60 bg-card/90 p-8 shadow-2xl shadow-slate-950/10 backdrop-blur-xl"
      >
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">Create account</p>
          <h2 className="text-3xl font-semibold tracking-tight">Launch your commerce profile</h2>
          <p className="text-sm text-muted-foreground">Register in under a minute and access the full platform.</p>
        </div>

        <div className="mt-5 flex gap-2 rounded-full border border-border/60 bg-muted/30 p-1 text-sm">
          <button
            type="button"
            onClick={() => setFormData((current) => ({ ...current, accountType: "customer" }))}
            className={`flex-1 rounded-full px-4 py-2 text-center font-medium transition ${formData.accountType === "customer" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => setFormData((current) => ({ ...current, accountType: "seller" }))}
            className={`flex-1 rounded-full px-4 py-2 text-center font-medium transition ${formData.accountType === "seller" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            Seller
          </button>
        </div>

        {(error || localError) ? (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error || localError}</span>
          </div>
        ) : null}

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="firstName" value={formData.firstName} onChange={(event) => setFormData((current) => ({ ...current, firstName: event.target.value }))} placeholder="John" className="h-12 rounded-2xl pl-10" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="lastName" value={formData.lastName} onChange={(event) => setFormData((current) => ({ ...current, lastName: event.target.value }))} placeholder="Doe" className="h-12 rounded-2xl pl-10" />
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" type="email" value={formData.email} onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))} placeholder="you@company.com" className="h-12 rounded-2xl pl-10" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" type="password" value={formData.password} onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))} placeholder="Create a password" className="h-12 rounded-2xl pl-10" />
            </div>
            <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" className="h-4 w-4 rounded border-border" />
            I agree to the terms and privacy policy.
          </div>

          <Button type="submit" disabled={isLoading} className="h-12 w-full rounded-2xl text-base font-semibold shadow-lg shadow-primary/20">
            {isLoading ? (
              <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Creating account</span>
            ) : (
              "Create account"
            )}
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link href="/auth/login" className="font-medium text-primary">Sign in as customer or seller</Link>
        </p>
      </motion.form>
    </AuthShell>
  );
}
