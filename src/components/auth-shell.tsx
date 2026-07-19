import Link from "next/link";
import { SiteThemeToggle } from "@/components/site-theme-toggle";
import { ArrowUpRight, ShieldCheck, Sparkles, Zap } from "lucide-react";

type AuthShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  badge?: string;
};

const authHighlights = [
  { label: "Secure checkout", value: "Encrypted" },
  { label: "Vendor scale", value: "Multi-role" },
  { label: "Support", value: "24/7" },
];

export function AuthShell({ title, description, children, badge = "Premium commerce access" }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.15fr_0.85fr]">
        <section className="relative hidden overflow-hidden border-r border-border/60 bg-card/70 px-10 py-8 lg:flex lg:flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_30%)]" />
          <div className="relative flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-[0.22em] text-muted-foreground">LUXESHOP</p>
                <p className="text-lg font-semibold">Marketplace</p>
              </div>
            </Link>
            <SiteThemeToggle />
          </div>

          <div className="relative mt-20 max-w-xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              {badge}
            </span>
            <h1 className="text-5xl font-semibold leading-tight tracking-tight">{title}</h1>
            <p className="max-w-lg text-base leading-7 text-muted-foreground">{description}</p>

            <div className="grid gap-4 sm:grid-cols-3">
              {authHighlights.map((item) => (
                <div key={item.label} className="rounded-3xl border border-border/60 bg-background/70 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
                  <p className="mt-2 text-lg font-semibold">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[32px] border border-border/60 bg-background/70 p-6 shadow-xl shadow-primary/5 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Built for real commerce</p>
                  <p className="text-sm text-muted-foreground">Clean hierarchy, fast workflows, and role-based clarity across the platform.</p>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
                <span>Stripe-style clarity</span>
                <ArrowUpRight className="h-4 w-4" />
                <span>Amazon-scale operations</span>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-md space-y-6">
            <div className="flex items-center justify-between lg:hidden">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-[0.22em] text-muted-foreground">LUXESHOP</p>
                  <p className="text-lg font-semibold">Marketplace</p>
                </div>
              </Link>
              <SiteThemeToggle />
            </div>
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
