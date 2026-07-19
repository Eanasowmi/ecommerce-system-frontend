"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Receipt,
  ShoppingBag,
  Star,
  Truck,
  User,
  Loader2,
} from "lucide-react";
import { RoleDashboardShell } from "@/components/role-dashboard-shell";
import { EditProfileModal } from "@/components/edit-profile-modal";
import { productApi, orderApi } from "@/lib/api-client";
import type { ProductDto, OrderDto, UserProfileDto } from "@/types";

const customerNavItems = [
  { label: "Dashboard", href: "/customer", icon: LayoutDashboard },
  { label: "My Orders", href: "/orders", icon: Package },
  { label: "Wishlist", href: "/products", icon: Heart },
  { label: "Cart", href: "/cart", icon: ShoppingBag },
  { label: "Addresses", href: "/customer#addresses", icon: MapPin },
  { label: "Profile", href: "/customer#profile", icon: User },
  { label: "Reviews", href: "/customer#reviews", icon: Star },
  { label: "Notifications", href: "/customer#notifications", icon: Bell },
  { label: "Logout", href: "/auth/login", icon: LogOut },
];

function productImage(product: ProductDto) {
  return product.images?.find((image) => image.isPrimary || image.primary)?.url
    || product.images?.[0]?.url
    || "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=900";
}

function readAuthFromStorage() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("auth");
  if (!raw) return null;
  try { return JSON.parse(raw) as { firstName?: string; lastName?: string; profilePictureUrl?: string }; }
  catch { return null; }
}

export default function CustomerDashboardPage() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState("");
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | undefined>(undefined);

  // Load display name and avatar from local storage on mount
  useEffect(() => {
    const auth = readAuthFromStorage();
    if (auth) {
      setUserDisplayName(`${auth.firstName ?? ""} ${auth.lastName ?? ""}`.trim());
      setUserAvatarUrl(auth.profilePictureUrl || undefined);
    }
  }, []);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [productsResponse, ordersResponse] = await Promise.all([
          productApi.getAllProducts(0, 4),
          orderApi.getMyOrders(),
        ]);
        const prodData = productsResponse.data as { content?: ProductDto[] };
        setProducts(prodData.content || []);
        setOrders(ordersResponse.data as OrderDto[]);
      } catch {
        setProducts([]);
        setOrders([]);
      } finally {
        setIsLoadingOrders(false);
      }
    }

    void loadDashboardData();
  }, []);

  const totalSpent = useMemo(() =>
    orders.filter((o) => o.status !== "CANCELLED").reduce((sum, o) => sum + o.totalAmount, 0),
    [orders]
  );

  function handleProfileSaved(profile: UserProfileDto) {
    setUserDisplayName(`${profile.firstName} ${profile.lastName}`.trim());
    setUserAvatarUrl(profile.profilePictureUrl || undefined);
    
    // Also update the global auth localStorage so other tabs/components sync
    const raw = localStorage.getItem("auth");
    if (raw) {
      try {
        const auth = JSON.parse(raw);
        if (auth.user) {
          auth.user.firstName = profile.firstName;
          auth.user.lastName = profile.lastName;
          auth.user.profilePictureUrl = profile.profilePictureUrl;
          localStorage.setItem("auth", JSON.stringify(auth));
        }
      } catch { /* ignore */ }
    }
  }

  return (
    <>
      <EditProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSaved={handleProfileSaved}
      />
      <RoleDashboardShell
        role="Customer"
        title="Customer Dashboard"
        description="Track orders, manage your wishlist, and keep your account details organized from one premium control center."
        accentClassName="from-slate-900 via-slate-700 to-sky-600"
        navItems={customerNavItems}
        stats={[
          { label: "Orders", value: String(orders.length), detail: isLoadingOrders ? "Loading…" : `${orders.length} total orders`, icon: Receipt },
          { label: "Wishlist", value: "—", detail: "Browse products to add", icon: Heart },
          { label: "Total Spent", value: isLoadingOrders ? "—" : `$${totalSpent.toFixed(0)}`, detail: "Across all orders", icon: ShoppingBag },
          { label: "Reviews", value: "—", detail: "Rate your purchases", icon: Star },
        ]}
        actionHref="/products"
        actionLabel="Browse products"
        onEditProfile={() => setShowProfileModal(true)}
        userDisplayName={userDisplayName}
        userAvatarUrl={userAvatarUrl}
      >
        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">Recent orders</h3>
                <p className="text-sm text-muted-foreground">Order history with delivery and payment context.</p>
              </div>
              <Link href="/orders" className="text-sm font-medium text-primary transition hover:opacity-80">
                View all
              </Link>
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-border/60">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/60 text-muted-foreground">
                  <tr>
                    <th className="px-5 py-4 font-medium">Order</th>
                    <th className="px-5 py-4 font-medium">Date</th>
                    <th className="px-5 py-4 font-medium">Items</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-background/80">
                  {isLoadingOrders ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                      </td>
                    </tr>
                  ) : orders && orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order.id} className="transition hover:bg-muted/40">
                        <td className="px-5 py-4 font-medium">
                          <Link href={`/orders/${order.id}`} className="hover:underline text-primary">
                            {order.orderNumber || order.id.slice(0, 8)}
                          </Link>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          <div className="space-y-0.5">
                            {order.items?.map((item) => (
                              <p key={item.id} className="text-xs">
                                {item.productName} (x{item.quantity})
                              </p>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              order.status === "DELIVERED"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/35 dark:text-emerald-400"
                                : order.status === "SHIPPED"
                                ? "bg-sky-100 text-sky-800 dark:bg-sky-900/35 dark:text-sky-400"
                                : order.status === "PROCESSING"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/35 dark:text-amber-400"
                                : order.status === "PENDING"
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-900/35 dark:text-orange-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/35 dark:text-red-400"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-semibold">
                          ${order.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm" id="notifications">
              <h3 className="text-xl font-semibold">Recent activity</h3>
              <div className="mt-5 space-y-4">
                {isLoadingOrders ? (
                  <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : orders.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">No activity yet. Place your first order!</p>
                ) : (
                  orders.slice(0, 3).map((order) => {
                    const Icon = order.status === "DELIVERED" ? CheckCircle2 : order.status === "SHIPPED" ? Truck : Receipt;
                    return (
                      <div key={order.id} className="flex gap-4 rounded-2xl border border-border/60 bg-background/70 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{order.orderNumber || order.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">{order.status} — ${order.totalAmount.toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm" id="addresses">
              <h3 className="text-xl font-semibold">Saved addresses</h3>
              <div className="mt-5">
                <div className="rounded-2xl border border-dashed border-border/60 bg-background/30 p-4 text-center text-sm text-muted-foreground">
                  Address management coming soon. Shipping address is entered at checkout.
                </div>
              </div>
            </div>
          </motion.aside>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm"
            id="wishlist"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">Wishlist highlights</h3>
                <p className="text-sm text-muted-foreground">Favorites ready to move into the cart.</p>
              </div>
              <Link href="/products" className="text-sm font-medium text-primary">
                Shop now
              </Link>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {products.map((product) => (
                <div key={product.id} className="overflow-hidden rounded-3xl border border-border/60 bg-background/70">
                  <div
                    className="aspect-[4/3] bg-cover bg-center"
                    style={{ backgroundImage: `url(${productImage(product)})` }}
                    aria-label={product.name}
                  />
                  <div className="space-y-2 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{product.categoryName || "Catalog"}</p>
                    <h4 className="font-semibold">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">{product.vendorName || "Verified seller"}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold">${(product.discountPrice ?? product.price).toFixed(2)}</span>
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">{product.stockQuantity} left</span>
                    </div>
                  </div>
                </div>
              ))}
              {!products.length ? (
                 <div className="rounded-3xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground sm:col-span-2 xl:col-span-4">
                   No products available. Products are listed after admin approval.
                 </div>
               ) : null}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm"
            id="profile"
          >
            <h3 className="text-xl font-semibold">Profile</h3>
            <div className="mt-5 space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/70 p-6">
                <div className="flex items-center gap-4">
                  {userAvatarUrl ? (
                    <img src={userAvatarUrl} alt="Profile" className="h-16 w-16 rounded-full object-cover border-2 border-border/60" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary border-2 border-border/60">
                      {userDisplayName?.[0] || "U"}
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-semibold">{userDisplayName || "Customer User"}</p>
                    <p className="text-sm text-muted-foreground">Manage your personal information and preferences.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-md transition hover:bg-primary/90"
                >
                  <User className="h-4 w-4" />
                  Edit Profile
                </button>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/70 p-4" id="reviews">
                <p className="font-medium">Reviews</p>
                <p className="text-sm text-muted-foreground">Rate purchases and reply to vendor messages.</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <p className="font-medium">Returns</p>
                <p className="text-sm text-muted-foreground">Manage requests, replacements, and delivery claims.</p>
              </div>
            </div>
          </motion.section>
        </div>
      </RoleDashboardShell>
    </>
  );
}
