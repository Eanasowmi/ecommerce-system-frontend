"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SiteThemeToggle } from "@/components/site-theme-toggle";
import { ArrowUpRight, LucideIcon, Pencil, ShieldCheck, Sparkles } from "lucide-react";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

export type DashboardStat = {
  label: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
};

type RoleDashboardShellProps = {
  role: string;
  title: string;
  description: string;
  accentClassName?: string;
  navItems: DashboardNavItem[];
  stats?: DashboardStat[];
  children: React.ReactNode;
  actionHref?: string;
  actionLabel?: string;
  /** Optional callback to open the edit-profile modal from the shell header */
  onEditProfile?: () => void;
  /** Optional user display name and avatar shown in the sidebar */
  userDisplayName?: string;
  userAvatarUrl?: string;
};

export function RoleDashboardShell({
  role,
  title,
  description,
  accentClassName = "from-slate-900 to-slate-600",
  navItems,
  stats,
  children,
  actionHref = "/products",
  actionLabel = "Open storefront",
  onEditProfile,
  userDisplayName,
  userAvatarUrl,
}: RoleDashboardShellProps) {
  const pathname = usePathname();
  const avatarFallback = userDisplayName
    ? userDisplayName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : role[0].toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground lg:flex">
      <aside className="hidden w-[300px] shrink-0 border-r border-border/60 bg-card/75 px-5 py-6 backdrop-blur-xl lg:flex lg:flex-col">
        <div className={cn("rounded-[28px] bg-gradient-to-br p-5 text-white shadow-2xl", accentClassName)}>
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white/80">{role}</span>
          </div>
          <h1 className="mt-8 text-2xl font-semibold leading-tight">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-white/75">{description}</p>
        </div>

        {/* Profile card in sidebar */}
        {(userDisplayName || onEditProfile) && (
          <div className="mt-4 flex items-center gap-3 rounded-[24px] border border-border/60 bg-background/70 p-4">
            {userAvatarUrl ? (
              <img
                src={userAvatarUrl}
                alt={userDisplayName || "Avatar"}
                className="h-11 w-11 rounded-full object-cover border border-border/40"
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary border border-primary/20">
                {avatarFallback}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{userDisplayName || role}</p>
              <p className="text-xs text-muted-foreground capitalize">{role.toLowerCase()} account</p>
            </div>
            {onEditProfile && (
              <button
                type="button"
                onClick={onEditProfile}
                title="Edit profile"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        <nav className="mt-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition",
                  active ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
                <span className="flex items-center gap-2 text-xs">
                  {item.badge ? <span className="rounded-full bg-white/15 px-2 py-0.5">{item.badge}</span> : null}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 rounded-[28px] border border-border/60 bg-background/70 p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Role control</p>
              <p className="text-xs text-muted-foreground">Permissions scoped to {role.toLowerCase()} workflows</p>
            </div>
          </div>
          <Link href={actionHref} className="mt-5 inline-flex w-full items-center justify-center rounded-2xl border border-border/60 px-4 py-3 text-sm font-medium transition hover:bg-muted">
            {actionLabel}
          </Link>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{role} dashboard</p>
              <h2 className="text-lg font-semibold sm:text-2xl">{title}</h2>
            </div>
            <div className="flex items-center gap-3">
              <Link href={actionHref} className="hidden rounded-full border border-border/60 px-4 py-2 text-sm font-medium transition hover:bg-muted md:inline-flex">
                {actionLabel}
              </Link>
              <SiteThemeToggle />
              {onEditProfile ? (
                <button
                  type="button"
                  onClick={onEditProfile}
                  className="flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  {userAvatarUrl ? (
                    <img src={userAvatarUrl} alt="avatar" className="h-6 w-6 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {avatarFallback}
                    </div>
                  )}
                  <span className="hidden sm:inline">{userDisplayName || "Profile"}</span>
                  <Pencil className="h-3.5 w-3.5 opacity-60" />
                </button>
              ) : (
                <div className="hidden h-10 items-center rounded-full border border-border/60 bg-card px-3 text-sm font-medium text-muted-foreground sm:flex">
                  Enterprise mode
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <section className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-[0_18px_60px_-28px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-3xl space-y-2">
                <p className="text-sm font-medium text-primary">{role} workspace</p>
                <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h3>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                Secure, responsive, and reusable UI foundation
              </div>
            </div>

            {stats?.length ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="rounded-3xl border border-border/60 bg-background/80 p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="mt-3 text-3xl font-semibold tracking-tight">{stat.value}</div>
                      {stat.detail ? <p className="mt-2 text-sm text-muted-foreground">{stat.detail}</p> : null}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </section>

          {children}
        </main>
      </div>
    </div>
  );
}
