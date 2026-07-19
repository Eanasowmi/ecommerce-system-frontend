"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  FileClock,
  LayoutDashboard,
  Loader2,
  LogIn,
  Save,
  ServerCrash,
  Settings,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { RoleDashboardShell } from "@/components/role-dashboard-shell";
import { adminApi } from "@/lib/api-client";
import type { AdminOverviewDto, UserDto } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActivityEntry {
  id: string;
  message: string;
  time: string;
  type: "role" | "status" | "settings";
}

interface SiteSettings {
  siteName: string;
  maintenanceMode: boolean;
  currency: string;
  contactEmail: string;
  maxProductsPerSeller: number;
}

const SETTINGS_KEY = "superadmin_site_settings";

const defaultSettings: SiteSettings = {
  siteName: "ShopVerse",
  maintenanceMode: false,
  currency: "USD",
  contactEmail: "admin@shopverse.com",
  maxProductsPerSeller: 100,
};

// ─── Nav ──────────────────────────────────────────────────────────────────────

const superAdminNavItems = [
  { label: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
  { label: "Admin Management", href: "/super-admin#admins", icon: Users },
  { label: "Role Management", href: "/super-admin#roles", icon: ShieldCheck },
  { label: "User Management", href: "/super-admin#users", icon: BadgeCheck },
  { label: "Website Settings", href: "/super-admin#settings", icon: Settings },
  { label: "System Logs", href: "/super-admin#logs", icon: FileClock },
  { label: "Analytics", href: "/super-admin#analytics", icon: Activity },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `$` + (value / 1_000_000).toFixed(1) + `M`;
  if (value >= 1_000) return `$` + (value / 1_000).toFixed(1) + `K`;
  return `$` + value.toFixed(2);
}

function formatCount(value: number) {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + `M`;
  if (value >= 1_000) return (value / 1_000).toFixed(1) + `K`;
  return String(value);
}

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const ALL_ROLES = ["CUSTOMER", "SELLER", "ADMIN", "SUPER_ADMIN"];

// ─── Role badge chip ──────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const colours: Record<string, string> = {
    SUPER_ADMIN: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    ADMIN: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    SELLER: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    CUSTOMER: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${colours[role] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {role}
    </span>
  );
}

// ─── Role dropdown editor ─────────────────────────────────────────────────────

function RoleEditor({
  userId,
  current,
  onSaved,
  addActivity,
}: {
  userId: string;
  current: string[];
  onSaved: (updated: UserDto) => void;
  addActivity: (entry: Omit<ActivityEntry, "id">) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(current);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (role: string) =>
    setSelected((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );

  const save = async () => {
    if (selected.length === 0) { setError("Select at least one role."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.updateUserRoles(userId, selected);
      const updated = res.data as UserDto;
      onSaved(updated);
      addActivity({ message: `Roles updated → ${selected.join(", ")}`, time: nowLabel(), type: "role" });
      setOpen(false);
    } catch {
      setError("Failed to update roles. Check permissions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-xl border border-border/60 bg-background/70 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        Edit roles <ChevronDown className="h-3 w-3 opacity-60" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-9 z-50 w-52 rounded-2xl border border-border/60 bg-card shadow-xl"
          >
            <div className="p-3 space-y-1.5">
              {ALL_ROLES.map((role) => (
                <label
                  key={role}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1.5 text-sm transition hover:bg-muted/60"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(role)}
                    onChange={() => toggle(role)}
                    className="accent-primary"
                  />
                  <RoleBadge role={role} />
                </label>
              ))}
              {error && <p className="px-1 text-xs text-destructive">{error}</p>}
              <button
                type="button"
                onClick={() => void save()}
                disabled={loading}
                className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function SuperAdminDashboardPage() {
  const [overview, setOverview] = useState<AdminOverviewDto | null>(null);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [overviewError, setOverviewError] = useState("");
  const [usersError, setUsersError] = useState("");

  // per-row status toggle loading
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toggleErrors, setToggleErrors] = useState<Record<string, string>>({});

  // session activity log
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
  const addActivity = (entry: Omit<ActivityEntry, "id">) =>
    setActivityLog((prev) => [{ ...entry, id: crypto.randomUUID() }, ...prev].slice(0, 20));

  // website settings (localStorage-backed)
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsDirty, setSettingsDirty] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try { setSettings(JSON.parse(stored) as SiteSettings); } catch { /* ignore */ }
    }
  }, []);

  const updateSetting = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSettingsDirty(true);
    setSettingsSaved(false);
  };

  const saveSettings = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSettingsDirty(false);
    setSettingsSaved(true);
    addActivity({ message: "Website settings saved", time: nowLabel(), type: "settings" });
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  // ─── Data fetching ────────────────────────────────────────────────────────

  useEffect(() => {
    setIsLoadingOverview(true);
    adminApi
      .getOverview()
      .then((res) => setOverview(res.data as AdminOverviewDto))
      .catch(() => setOverviewError("Failed to load platform overview."))
      .finally(() => setIsLoadingOverview(false));
  }, []);

  useEffect(() => {
    setIsLoadingUsers(true);
    adminApi
      .getUsers()
      .then((res) => setUsers(res.data as UserDto[]))
      .catch(() => setUsersError("Failed to load users."))
      .finally(() => setIsLoadingUsers(false));
  }, []);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const toggleStatus = async (user: UserDto) => {
    setTogglingId(user.id);
    setToggleErrors((prev) => ({ ...prev, [user.id]: "" }));
    try {
      const res = await adminApi.updateUserStatus(user.id, !user.enabled);
      const updated = res.data as UserDto;
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      addActivity({
        message: `${updated.firstName} ${updated.lastName} → ${updated.enabled ? "enabled" : "disabled"}`,
        time: nowLabel(),
        type: "status",
      });
    } catch {
      setToggleErrors((prev) => ({
        ...prev,
        [user.id]: "Permission denied or server error.",
      }));
    } finally {
      setTogglingId(null);
    }
  };

  const onRoleSaved = (updated: UserDto) =>
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));

  // ─── Derived data ─────────────────────────────────────────────────────────

  const admins = users.filter((u) => u.roles?.some((r) => r.includes("ADMIN")));

  const stats = isLoadingOverview
    ? [
        { label: "Total Users", value: "-", detail: "Loading...", icon: Users },
        { label: "Total Revenue", value: "-", detail: "Loading...", icon: Wallet },
        { label: "Active Sellers", value: "-", detail: "Loading...", icon: BadgeCheck },
        { label: "Active Customers", value: "-", detail: "Loading...", icon: LogIn },
      ]
    : overview
    ? [
        { label: "Total Users", value: formatCount(overview.totalUsers), detail: "Across all roles", icon: Users },
        { label: "Total Revenue", value: formatCurrency(overview.totalRevenue ?? 0), detail: "Platform gross sales", icon: Wallet },
        { label: "Active Sellers", value: formatCount(overview.totalSellers), detail: "Approved and live", icon: BadgeCheck },
        { label: "Active Customers", value: formatCount(overview.totalCustomers), detail: "Registered buyers", icon: LogIn },
      ]
    : [
        { label: "Total Users", value: "N/A", detail: overviewError, icon: Users },
        { label: "Total Revenue", value: "N/A", detail: "Unavailable", icon: Wallet },
        { label: "Active Sellers", value: "N/A", detail: "Unavailable", icon: BadgeCheck },
        { label: "Active Customers", value: "N/A", detail: "Unavailable", icon: LogIn },
      ];

  const roleBreakdown = [
    { label: "Customers", value: overview?.totalCustomers ?? 0, colour: "bg-emerald-500" },
    { label: "Sellers", value: overview?.totalSellers ?? 0, colour: "bg-sky-500" },
    { label: "Admins", value: (overview?.totalAdmins ?? 0), colour: "bg-violet-500" },
    { label: "Total", value: overview?.totalUsers ?? 0, colour: "bg-slate-500" },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <RoleDashboardShell
      role="Super Admin"
      title="Super Admin Dashboard"
      description="Manage roles, administrative access, website settings, and system health from one secure control plane."
      accentClassName="from-slate-950 via-slate-800 to-indigo-600"
      navItems={superAdminNavItems}
      stats={stats}
      actionHref="/super-admin#settings"
      actionLabel="System settings"
    >
      {/* ── Admin Management + Analytics ────────────────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]" id="admins">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">Admin management</h3>
              <p className="text-sm text-muted-foreground">View and audit admin accounts with clear access boundaries.</p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-border/60">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="px-5 py-4 font-medium">Admin</th>
                  <th className="px-5 py-4 font-medium">Email</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Roles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 bg-background/80">
                {isLoadingUsers ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </td>
                  </tr>
                ) : usersError ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-4">
                      <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{usersError}</span>
                      </div>
                    </td>
                  </tr>
                ) : admins.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                      No admin accounts found.
                    </td>
                  </tr>
                ) : (
                  admins.map((admin) => (
                    <tr key={admin.id} className="transition hover:bg-muted/40">
                      <td className="px-5 py-4 font-medium">
                        {admin.firstName} {admin.lastName}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{admin.email}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-medium ${admin.enabled ? "text-emerald-500" : "text-amber-500"}`}>
                          {admin.enabled ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {admin.roles?.map((r) => <RoleBadge key={r} role={r} />)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
          id="analytics"
        >
          <div className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm">
            <h3 className="text-xl font-semibold">Governance snapshot</h3>
            <div className="mt-5 space-y-4 text-sm">
              {[
                { title: "Access policy", copy: "All privileged actions require confirmation and activity logging." },
                { title: "System uptime", copy: "Rolling deployments with zero-downtime migrations." },
                { title: "Security posture", copy: "Role scoping and fraud monitoring enabled across teams." },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-muted-foreground">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm" id="roles">
            <h3 className="text-xl font-semibold">Role management</h3>
            {isLoadingOverview ? (
              <div className="mt-4 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : overview ? (
              <div className="mt-4 space-y-3">
                {roleBreakdown.map((item) => {
                  const pct = overview.totalUsers > 0 ? Math.round((item.value / overview.totalUsers) * 100) : 0;
                  return (
                    <div key={item.label} className="rounded-2xl border border-border/60 bg-background/70 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-semibold">{formatCount(item.value)}</p>
                      </div>
                      {item.label !== "Total" && (
                        <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-full rounded-full ${item.colour}`}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </motion.section>
      </div>

      {/* ── User Management ──────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm"
        id="users"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">User management</h3>
            <p className="text-sm text-muted-foreground">
              Enable/disable accounts and reassign roles — Super Admin only.
            </p>
          </div>
          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400">
            {users.length} users
          </span>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-border/60">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/60 text-muted-foreground">
              <tr>
                <th className="px-5 py-4 font-medium">User</th>
                <th className="px-5 py-4 font-medium">Roles</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-background/80">
              {isLoadingUsers ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  </td>
                </tr>
              ) : usersError ? (
                <tr>
                  <td colSpan={4} className="px-5 py-4">
                    <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{usersError}</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="transition hover:bg-muted/30">
                    <td className="px-5 py-4">
                      <p className="font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      {toggleErrors[user.id] && (
                        <p className="mt-0.5 text-xs text-destructive">{toggleErrors[user.id]}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((r) => <RoleBadge key={r} role={r} />)}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        disabled={togglingId === user.id}
                        onClick={() => void toggleStatus(user)}
                        title={user.enabled ? "Click to disable" : "Click to enable"}
                        className="flex items-center gap-1.5 transition"
                      >
                        {togglingId === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : user.enabled ? (
                          <>
                            <ToggleRight className="h-5 w-5 text-emerald-500" />
                            <span className="text-xs font-medium text-emerald-500">Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">Disabled</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <RoleEditor
                        userId={user.id}
                        current={user.roles ?? []}
                        onSaved={onRoleSaved}
                        addActivity={addActivity}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* ── Website Settings + System Logs ───────────────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]" id="settings">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">Website settings</h3>
              <p className="text-sm text-muted-foreground">Platform-wide configuration.</p>
            </div>
            <AnimatePresence>
              {settingsSaved && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Saved
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-6 space-y-4">
            {/* Site Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Site name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => updateSetting("siteName", e.target.value)}
                className="w-full rounded-2xl border border-border/60 bg-background/70 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Contact Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contact email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => updateSetting("contactEmail", e.target.value)}
                className="w-full rounded-2xl border border-border/60 bg-background/70 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Currency */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Default currency</label>
              <select
                value={settings.currency}
                onChange={(e) => updateSetting("currency", e.target.value)}
                className="w-full rounded-2xl border border-border/60 bg-background/70 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {["USD", "EUR", "GBP", "INR", "CAD", "AUD"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Max Products Per Seller */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Max products per seller
              </label>
              <input
                type="number"
                min={1}
                max={10000}
                value={settings.maxProductsPerSeller}
                onChange={(e) => updateSetting("maxProductsPerSeller", Number(e.target.value))}
                className="w-full rounded-2xl border border-border/60 bg-background/70 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Maintenance Mode */}
            <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Maintenance mode</p>
                <p className="text-xs text-muted-foreground">Temporarily hide the storefront.</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting("maintenanceMode", !settings.maintenanceMode)}
                className="relative h-6 w-11 rounded-full transition-colors focus:outline-none"
                style={{ background: settings.maintenanceMode ? "hsl(var(--primary))" : "hsl(var(--muted))" }}
              >
                <span
                  className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
                  style={{ transform: settings.maintenanceMode ? "translateX(20px)" : "translateX(0)" }}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={saveSettings}
              disabled={!settingsDirty}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
            >
              <Save className="h-4 w-4" />
              Save settings
            </button>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm"
          id="logs"
        >
          <h3 className="text-xl font-semibold">System logs</h3>
          <p className="text-sm text-muted-foreground mt-1">Live session activity for this session.</p>

          <div className="mt-5 space-y-2.5">
            {activityLog.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/60 bg-background/30 p-6 text-center text-sm text-muted-foreground">
                No activity yet. Actions you take will appear here.
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {activityLog.map((entry) => {
                  const colours: Record<string, string> = {
                    role: "border-violet-500/30 bg-violet-500/10 text-violet-400",
                    status: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
                    settings: "border-sky-500/30 bg-sky-500/10 text-sky-400",
                  };
                  const dot: Record<string, string> = {
                    role: "bg-violet-400",
                    status: "bg-emerald-400",
                    settings: "bg-sky-400",
                  };
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${colours[entry.type]}`}
                    >
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot[entry.type]}`} />
                      <span className="flex-1">{entry.message}</span>
                      <span className="text-xs opacity-60">{entry.time}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          <div className="mt-6 rounded-3xl border border-border/60 bg-muted/30 p-5">
            <div className="flex items-center gap-3">
              <ServerCrash className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Incident response</p>
                <p className="text-sm text-muted-foreground">
                  Escalate, isolate, and document operational issues within one workflow.
                </p>
              </div>
            </div>
          </div>

          {activityLog.length > 0 && (
            <button
              type="button"
              onClick={() => setActivityLog([])}
              className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" /> Clear log
            </button>
          )}
        </motion.section>
      </div>
    </RoleDashboardShell>
  );
}
