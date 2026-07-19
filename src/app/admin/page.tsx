"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  BadgeCheck,
  BarChart3,
  Boxes,
  CircleDollarSign,
  LayoutDashboard,
  Loader2,
  Megaphone,
  Package,
  Receipt,
  Settings,
  Users,
} from "lucide-react";
import { RoleDashboardShell } from "@/components/role-dashboard-shell";
import { Button } from "@/components/ui/button";
import { adminApi, productApi, orderApi } from "@/lib/api-client";
import type { AdminOverviewDto, OrderDto, ProductDto, UserDto } from "@/types";
import { useEffect, useState } from "react";

const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Sellers", href: "/admin#sellers", icon: BadgeCheck },
  { label: "Customers", href: "/admin#customers", icon: Users },
  { label: "Products", href: "/admin#products", icon: Package },
  { label: "Categories", href: "/admin#categories", icon: Boxes },
  { label: "Orders", href: "/admin#orders", icon: Receipt },
  { label: "Coupons", href: "/admin#coupons", icon: Megaphone },
  { label: "Reports", href: "/admin#reports", icon: BarChart3 },
  { label: "Settings", href: "/admin#settings", icon: Settings },
];

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

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<AdminOverviewDto | null>(null);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [pendingProducts, setPendingProducts] = useState<ProductDto[]>([]);
  const [recentOrders, setRecentOrders] = useState<OrderDto[]>([]);

  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isApproving, setIsApproving] = useState(false);

  const [overviewError, setOverviewError] = useState("");
  const [usersError, setUsersError] = useState("");
  const [pendingError, setPendingError] = useState("");
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    setIsLoadingOverview(true);
    adminApi.getOverview()
      .then((res) => { setOverview(res.data as AdminOverviewDto); })
      .catch((err) => {
        const status = (err as { response?: { status?: number } })?.response?.status;
        setOverviewError(status === 403 || status === 401 ? "Access denied. Admin login required." : "Failed to load overview statistics.");
      })
      .finally(() => setIsLoadingOverview(false));
  }, []);

  useEffect(() => {
    setIsLoadingUsers(true);
    adminApi.getUsers()
      .then((res) => { setUsers(res.data as UserDto[]); })
      .catch(() => setUsersError("Failed to load users."))
      .finally(() => setIsLoadingUsers(false));
  }, []);

  useEffect(() => {
    setIsLoadingProducts(true);
    productApi.getPendingProducts(0, 50)
      .then((res) => {
        const data = res.data as { content?: ProductDto[] };
        setPendingProducts(data.content || []);
      })
      .catch((err) => {
        const status = (err as { response?: { status?: number } })?.response?.status;
        setPendingError(status === 403 || status === 401 ? "You don't have permission to view pending products." : "Failed to load pending products.");
      })
      .finally(() => setIsLoadingProducts(false));
  }, []);

  useEffect(() => {
    setIsLoadingOrders(true);
    orderApi.getAllOrders()
      .then((res) => { setRecentOrders((res.data as OrderDto[]).slice(0, 5)); })
      .catch(() => setOrdersError("Failed to load orders."))
      .finally(() => setIsLoadingOrders(false));
  }, []);

  const approveProduct = async (productId: string) => {
    setIsApproving(true);
    setPendingError("");
    try {
      const response = await productApi.approveProduct(productId);
      const updatedProduct = response.data as ProductDto;
      setPendingProducts((current) => current.filter((p) => p.id !== updatedProduct.id));
    } catch {
      setPendingError("Failed to approve product. Please try again.");
    } finally {
      setIsApproving(false);
    }
  };

  const sellers = users.filter((u) => u.roles?.some((r) => r.includes("SELLER")));
  const customers = users.filter((u) => u.roles?.some((r) => r.includes("CUSTOMER")));

  const stats = isLoadingOverview
    ? [
        { label: "Total Revenue", value: "-", detail: "Loading...", icon: CircleDollarSign },
        { label: "Orders", value: "-", detail: "Loading...", icon: Receipt },
        { label: "Customers", value: "-", detail: "Loading...", icon: Users },
        { label: "Sellers", value: "-", detail: "Loading...", icon: BadgeCheck },
      ]
    : overview
    ? [
        { label: "Total Revenue", value: formatCurrency(overview.totalRevenue ?? 0), detail: overview.totalOrders + " total orders", icon: CircleDollarSign },
        { label: "Orders", value: formatCount(overview.totalOrders), detail: "Across all channels", icon: Receipt },
        { label: "Customers", value: formatCount(overview.totalCustomers), detail: "Registered buyers", icon: Users },
        { label: "Sellers", value: formatCount(overview.totalSellers), detail: "Active vendor accounts", icon: BadgeCheck },
      ]
    : [
        { label: "Total Revenue", value: "N/A", detail: overviewError, icon: CircleDollarSign },
        { label: "Orders", value: "N/A", detail: "Unavailable", icon: Receipt },
        { label: "Customers", value: "N/A", detail: "Unavailable", icon: Users },
        { label: "Sellers", value: "N/A", detail: "Unavailable", icon: BadgeCheck },
      ];

  return (
    <RoleDashboardShell
      role="Admin"
      title="Admin Dashboard"
      description="Operate the marketplace at scale with seller approvals, order control, product moderation, and report visibility."
      accentClassName="from-slate-950 via-slate-800 to-emerald-600"
      navItems={adminNavItems}
      stats={stats}
      actionHref="/admin#reports"
      actionLabel="View reports"
    >
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]" id="reports">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">Platform overview</h3>
              <p className="text-sm text-muted-foreground">Live database counts across all entities.</p>
            </div>
            <span className="rounded-full border border-border/60 px-3 py-1 text-xs font-medium text-muted-foreground">Real-time</span>
          </div>

          {isLoadingOverview ? (
            <div className="mt-8 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : overviewError ? (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{overviewError}</span>
            </div>
          ) : overview ? (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Products", value: formatCount(overview.totalProducts) },
                  { label: "Categories", value: formatCount(overview.totalCategories) },
                  { label: "Brands", value: formatCount(overview.totalBrands) },
                  { label: "Admins", value: formatCount(overview.totalAdmins) },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
              {overview.orderStatusCounts && Object.keys(overview.orderStatusCounts).length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Order status breakdown</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {Object.entries(overview.orderStatusCounts).map(([status, count]) => (
                      <div key={status} className="rounded-2xl border border-border/60 bg-background/70 p-3">
                        <p className="text-xs font-medium text-muted-foreground">{status}</p>
                        <p className="mt-1 text-lg font-semibold">{count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm" id="sellers">
            <h3 className="text-xl font-semibold">Seller management</h3>
            <div className="mt-5 space-y-3">
              {isLoadingUsers ? (
                <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : usersError ? (
                <p className="text-sm text-destructive">{usersError}</p>
              ) : sellers.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No sellers found.</p>
              ) : (
                sellers.slice(0, 5).map((seller) => (
                  <div key={seller.id} className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/70 p-4">
                    <div>
                      <p className="font-medium">{seller.firstName} {seller.lastName}</p>
                      <p className="text-xs text-muted-foreground">{seller.email}</p>
                    </div>
                    <span className={`text-xs font-medium ${seller.enabled ? "text-emerald-500" : "text-amber-500"}`}>
                      {seller.enabled ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm" id="settings">
            <h3 className="text-xl font-semibold">Controls</h3>
            <div className="mt-5 space-y-4 text-sm">
              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <p className="font-medium">Refund requests</p>
                <p className="text-muted-foreground">Review payout and return exceptions before release.</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <p className="font-medium">Platform announcements</p>
                <p className="text-muted-foreground">Schedule coupon campaigns and storefront banners.</p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]" id="products">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm"
        >
          <h3 className="text-xl font-semibold">Product moderation</h3>
          {pendingError ? (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{pendingError}</span>
            </div>
          ) : null}
          <div className="mt-6 overflow-hidden rounded-3xl border border-border/60">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="px-5 py-4 font-medium">Product</th>
                  <th className="px-5 py-4 font-medium">Vendor</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 bg-background/80">
                {isLoadingProducts ? (
                  <tr><td colSpan={4} className="px-5 py-8 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></td></tr>
                ) : pendingProducts.length ? (
                  pendingProducts.map((product) => (
                    <tr key={product.id} className="transition hover:bg-muted/40">
                      <td className="px-5 py-4 font-medium">{product.name}</td>
                      <td className="px-5 py-4 text-muted-foreground">{product.vendorName || "Unknown"}</td>
                      <td className="px-5 py-4"><span className="text-xs font-medium text-amber-600">Pending</span></td>
                      <td className="px-5 py-4 text-right">
                        <Button size="sm" variant="outline" disabled={isApproving} onClick={() => void approveProduct(product.id)}>
                          Approve
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">No pending products to review.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
          id="customers"
        >
          <div className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm">
            <h3 className="text-xl font-semibold">Customer moderation</h3>
            <div className="mt-5 space-y-3">
              {isLoadingUsers ? (
                <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : customers.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No customers found.</p>
              ) : (
                customers.slice(0, 5).map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/70 p-4">
                    <div>
                      <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                      <p className="text-xs text-muted-foreground">{customer.email}</p>
                    </div>
                    <span className={`text-sm ${customer.enabled ? "text-emerald-500" : "text-amber-500"}`}>
                      {customer.enabled ? "Active" : "Blocked"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm" id="orders">
            <h3 className="text-xl font-semibold">Order management</h3>
            <div className="mt-5 space-y-3">
              {isLoadingOrders ? (
                <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : ordersError ? (
                <p className="text-sm text-destructive">{ordersError}</p>
              ) : recentOrders.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No orders found.</p>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{order.orderNumber || order.id.slice(0, 8)}</p>
                      <span className={`text-xs font-medium ${
                        order.status === "DELIVERED" ? "text-emerald-500"
                          : order.status === "SHIPPED" ? "text-sky-500"
                          : order.status === "CANCELLED" ? "text-destructive"
                          : "text-amber-500"
                      }`}>{order.status}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {order.customerName || "Customer"} - ${order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]" id="categories">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm"
        >
          <h3 className="text-xl font-semibold">Reports</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              { title: "Revenue", copy: "Daily rollups and payout reconciliations." },
              { title: "Sales", copy: "Order conversion, refunds, and basket value." },
              { title: "Products", copy: "Approval ratio and catalog performance." },
              { title: "Categories", copy: "Category mix and growth opportunities." },
            ].map((report) => (
              <div key={report.title} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <p className="font-medium">{report.title}</p>
                <p className="text-sm text-muted-foreground">{report.copy}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm"
          id="coupons"
        >
          <h3 className="text-xl font-semibold">Coupon orchestration</h3>
          <div className="mt-5 rounded-2xl border border-dashed border-border/60 bg-background/30 p-6 text-center text-sm text-muted-foreground">
            No active coupons configured. Coupon management coming soon.
          </div>
        </motion.section>
      </div>
    </RoleDashboardShell>
  );
}
