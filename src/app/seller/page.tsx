"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Edit3,
  LayoutDashboard,
  Loader2,
  MessageSquareReply,
  Package,
  Plus,
  Save,
  ShoppingBag,
  Star,
  Trash2,
  Truck,
  User,
  Users,
  Wallet,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RoleDashboardShell } from "@/components/role-dashboard-shell";
import { EditProfileModal } from "@/components/edit-profile-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { brandApi, categoryApi, productApi, orderApi } from "@/lib/api-client";
import type { BrandDto, CategoryDto, ProductDto, OrderDto, UserProfileDto } from "@/types";

const sellerNavItems = [
  { label: "Dashboard", href: "/seller", icon: LayoutDashboard },
  { label: "Products", href: "/seller#products", icon: Package },
  { label: "Add Product", href: "/seller#add-product", icon: Plus },
  { label: "Inventory", href: "/seller#inventory", icon: ShoppingBag },
  { label: "Orders", href: "/seller#orders", icon: Truck },
  { label: "Customers", href: "/seller#customers", icon: Users },
  { label: "Reviews", href: "/seller#reviews", icon: Star },
  { label: "Analytics", href: "/seller#analytics", icon: BarChart3 },
  { label: "Profile", href: "/seller#profile", icon: User },
  { label: "Settings", href: "/seller#settings", icon: Wallet },
  { label: "Support", href: "/seller#support", icon: MessageSquareReply },
];

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  discountPrice: string;
  stockQuantity: string;
  sku: string;
  categoryId: string;
  brandId: string;
  imageUrls: string;
};

function errorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string; details?: Record<string, string> } } }).response;
    if (response?.data?.details) {
      return Object.values(response.data.details).join(" ");
    }
    return response?.data?.message || fallback;
  }
  return fallback;
}

function formFromProduct(product: ProductDto): ProductFormState {
  return {
    name: product.name,
    description: product.description || "",
    price: String(product.price),
    discountPrice: product.discountPrice ? String(product.discountPrice) : "",
    stockQuantity: String(product.stockQuantity),
    sku: product.sku,
    categoryId: product.categoryId || "",
    brandId: product.brandId || "",
    imageUrls: product.images?.map((image) => image.url).join("\n") || "",
  };
}

function emptyProductForm(): ProductFormState {
  return {
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    stockQuantity: "",
    sku: "",
    categoryId: "",
    brandId: "",
    imageUrls: "",
  };
}

const emptyForm = emptyProductForm();

function toProductRequest(form: ProductFormState) {
  return {
    name: form.name,
    description: form.description,
    price: parseFloat(form.price) || 0,
    discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : undefined,
    stockQuantity: parseInt(form.stockQuantity, 10) || 0,
    sku: form.sku,
    categoryId: form.categoryId || undefined,
    brandId: form.brandId || undefined,
    imageUrls: form.imageUrls
      .split(/\r?\n|,/)
      .map((url) => url.trim())
      .filter(Boolean),
  };
}

export default function SellerDashboardPage() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [brands, setBrands] = useState<BrandDto[]>([]);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [orderFilter, setOrderFilter] = useState<string>("ALL");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState("");
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | undefined>(undefined);

  // Read user info from local storage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("auth");
    if (!raw) return;
    try {
      const auth = JSON.parse(raw) as { firstName?: string; lastName?: string; profilePictureUrl?: string };
      setUserDisplayName(`${auth.firstName ?? ""} ${auth.lastName ?? ""}`.trim());
      setUserAvatarUrl(auth.profilePictureUrl || undefined);
    } catch { /* ignore */ }
  }, []);

  function handleProfileSaved(profile: UserProfileDto) {
    setUserDisplayName(`${profile.firstName} ${profile.lastName}`.trim());
    setUserAvatarUrl(profile.profilePictureUrl || undefined);
  }

  const totalStock = useMemo(
    () => products.reduce((sum, product) => sum + product.stockQuantity, 0),
    [products]
  );

  const totalValue = useMemo(
    () => products.reduce((sum, product) => sum + product.price * product.stockQuantity, 0),
    [products]
  );

  const lowStockCount = useMemo(
    () => products.filter((product) => product.stockQuantity > 0 && product.stockQuantity <= 5).length,
    [products]
  );

  const filteredOrders = useMemo(() => {
    return orderFilter === "ALL" ? orders : orders.filter((o) => o.status === orderFilter);
  }, [orders, orderFilter]);

  const totalRevenue = useMemo(
    () => orders.filter((o) => o.status !== "CANCELLED").reduce((sum, o) => sum + o.totalAmount, 0),
    [orders]
  );

  // Build monthly sales chart data from real orders (last 6 months)
  const monthlySalesData = useMemo(() => {
    const monthMap: Record<string, { month: string; revenue: number; orders: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("default", { month: "short" });
      monthMap[key] = { month: label, revenue: 0, orders: 0 };
    }
    for (const order of orders) {
      const d = new Date(order.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthMap[key]) {
        monthMap[key].revenue += order.totalAmount;
        monthMap[key].orders += 1;
      }
    }
    return Object.values(monthMap);
  }, [orders]);

  const loadDashboardData = async () => {
    try {
      const [productsResponse, categoriesResponse, brandsResponse, ordersResponse] = await Promise.all([
        productApi.getMyProducts(),
        categoryApi.getAllCategories(),
        brandApi.getAllBrands(),
        orderApi.getSellerOrders(),
      ]);

      setProducts(productsResponse.data as ProductDto[]);
      setCategories(categoriesResponse.data as CategoryDto[]);
      setBrands(brandsResponse.data as BrandDto[]);
      setOrders(ordersResponse.data as OrderDto[]);
    } catch (err) {
      setError(errorMessage(err, "Failed to load seller catalog"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboardData();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingProductId(null);
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    let estimatedDays: number | undefined = undefined;
    if (status === "SHIPPED") {
      const input = window.prompt("Please enter the estimated number of days for delivery:", "3");
      if (input === null) return; // User cancelled
      estimatedDays = parseInt(input, 10);
      if (isNaN(estimatedDays) || estimatedDays < 0) {
        setError("Invalid number of days. Status not updated.");
        return;
      }
    }

    try {
      await orderApi.updateOrderStatus(orderId, status, estimatedDays);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status, estimatedDeliveryDays: estimatedDays } : o));
      setMessage("Order status updated.");
    } catch (err) {
      setError(errorMessage(err, "Failed to update status"));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.name || !form.price || !form.sku) {
      setError("Product name, price, and SKU are required.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = toProductRequest(form);
      if (editingProductId) {
        const response = await productApi.updateProduct(editingProductId, payload);
        const updatedProduct = response.data as ProductDto;
        setProducts((current) => current.map((product) => product.id === updatedProduct.id ? updatedProduct : product));
        setMessage("Product updated.");
      } else {
        const response = await productApi.createProduct(payload);
        setProducts((current) => [response.data as ProductDto, ...current]);
        setMessage("Product added. Pending admin approval.");
      }
      resetForm();
    } catch (err) {
      setError(errorMessage(err, editingProductId ? "Failed to update product" : "Failed to add product"));
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (product: ProductDto) => {
    setEditingProductId(product.id);
    setForm(formFromProduct(product));
    setMessage("");
    setError("");
    document.getElementById("add-product")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const deleteProduct = async (product: ProductDto) => {
    const confirmed = window.confirm(`Delete ${product.name}?`);
    if (!confirmed) return;

    setError("");
    setMessage("");
    try {
      await productApi.deleteProduct(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      if (editingProductId === product.id) resetForm();
      setMessage("Product deleted.");
    } catch (err) {
      setError(errorMessage(err, "Failed to delete product"));
    }
  };

  return (
    <>
      <EditProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSaved={handleProfileSaved}
      />
      <RoleDashboardShell
        role="Seller"
        title="Seller Dashboard"
        description="Manage your catalog, orders, reviews, and revenue with a premium vendor workspace built for daily operations."
        accentClassName="from-slate-950 via-slate-700 to-cyan-600"
        navItems={sellerNavItems}
        stats={[
          { label: "Total Products", value: String(products.length), detail: "Your active catalog", icon: Package },
          { label: "Total Stock", value: String(totalStock), detail: "Units available", icon: ShoppingBag },
          { label: "Revenue", value: isLoading ? "—" : `$${totalRevenue.toFixed(0)}`, detail: "From non-cancelled orders", icon: Wallet },
          { label: "Low Stock", value: String(lowStockCount), detail: "5 units or fewer", icon: Truck },
        ]}
        actionHref="/seller#add-product"
        actionLabel="Add product"
        onEditProfile={() => setShowProfileModal(true)}
        userDisplayName={userDisplayName}
        userAvatarUrl={userAvatarUrl}
      >
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]" id="analytics">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">Monthly sales</h3>
                <p className="text-sm text-muted-foreground">Revenue and order trend across the last six months.</p>
              </div>
              <span className="rounded-full border border-border/60 px-3 py-1 text-xs font-medium text-muted-foreground">Catalog live</span>
            </div>
            <div className="mt-6 h-[320px]">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : monthlySalesData.every((d) => d.orders === 0) ? (
                <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-border/60 text-sm text-muted-foreground">
                  No sales data yet. Orders will appear here once received.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlySalesData}>
                    <defs>
                      <linearGradient id="sellerRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "16px",
                      }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#sellerRevenue)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm"
            id="products"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">Your products</h3>
                <p className="text-sm text-muted-foreground">Manage inventory, prices, and catalog status.</p>
              </div>
            </div>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-border/60">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Product</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Stock</th>
                    <th className="px-5 py-3 font-medium">Price</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                      </td>
                    </tr>
                  ) : products.length ? products.map((product) => (
                    <tr key={product.id} className="transition hover:bg-muted/40">
                      <td className="px-5 py-4">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">SKU {product.sku}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-medium ${product.active ? "text-emerald-600" : "text-amber-600"}`}>
                          {product.active ? "Active" : "Pending"}
                        </span>
                      </td>
                      <td className="px-5 py-4">{product.stockQuantity}</td>
                      <td className="px-5 py-4">${product.price.toFixed(2)}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => startEdit(product)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => void deleteProduct(product)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                        No products yet. Add one from the form.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div id="inventory"></div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm"
            id="add-product"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">{editingProductId ? "Edit product" : "Add product"}</h3>
                <p className="text-sm text-muted-foreground">Products are saved under the signed-in seller account.</p>
              </div>
              {editingProductId ? (
                <Button type="button" variant="outline" size="sm" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              ) : null}
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product name</Label>
                <Input id="name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="min-h-24 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountPrice">Discount price</Label>
                  <Input id="discountPrice" type="number" min="0" step="0.01" value={form.discountPrice} onChange={(event) => setForm((current) => ({ ...current, discountPrice: event.target.value }))} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Stock</Label>
                  <Input id="stockQuantity" type="number" min="0" value={form.stockQuantity} onChange={(event) => setForm((current) => ({ ...current, stockQuantity: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" value={form.sku} onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category</Label>
                  <select
                    id="categoryId"
                    value={form.categoryId}
                    onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">No category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brandId">Brand</Label>
                  <select
                    id="brandId"
                    value={form.brandId}
                    onChange={(event) => setForm((current) => ({ ...current, brandId: event.target.value }))}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">No brand</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrls">Image URLs</Label>
                <textarea
                  id="imageUrls"
                  value={form.imageUrls}
                  onChange={(event) => setForm((current) => ({ ...current, imageUrls: event.target.value }))}
                  placeholder="One URL per line"
                  className="min-h-20 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <Button type="submit" disabled={isSaving} className="w-full">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {editingProductId ? "Save changes" : "Add product"}
              </Button>
            </form>
          </motion.section>
        </div>

        <motion.section
          id="orders"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">Customer orders</h3>
              <p className="text-sm text-muted-foreground">Manage order statuses for your sold products.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setOrderFilter(status)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    orderFilter === status
                      ? "bg-primary text-primary-foreground"
                      : "border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {message && (
            <div className="mt-4 rounded-2xl bg-emerald-500/10 p-4 text-sm text-emerald-500 border border-emerald-500/20">
              {message}
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-2xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
              {error}
            </div>
          )}

          <div className="mt-6 overflow-x-auto rounded-2xl border border-border/60">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Order Number</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Items</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </td>
                  </tr>
                ) : filteredOrders.length ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="transition hover:bg-muted/40">
                      <td className="px-5 py-4 font-medium">
                        {order.orderNumber || order.id.slice(0, 8)}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium">{order.customerName || "N/A"}</p>
                        <p className="text-xs text-muted-foreground">{order.customerEmail || ""}</p>
                        {order.customerPhone && (
                          <p className="text-xs text-muted-foreground mt-0.5">{order.customerPhone}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {order.items?.map((item) => (
                            <p key={item.id} className="text-xs text-muted-foreground">
                              {item.productName} <span className="font-semibold">x{item.quantity}</span>
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
                      <td className="px-5 py-4 font-semibold">${order.totalAmount.toFixed(2)}</td>
                      <td className="px-5 py-4 text-right">
                        <select
                          value={order.status}
                          onChange={(e) => void handleUpdateOrderStatus(order.id, e.target.value)}
                          className="h-8 rounded-lg border border-border/60 bg-background px-2 text-xs outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.section>

        <motion.section
          id="profile"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm"
        >
          <h3 className="text-xl font-semibold">Profile</h3>
          <div className="mt-5 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/70 p-6">
              <div className="flex items-center gap-4">
                {userAvatarUrl ? (
                  <img src={userAvatarUrl} alt="Profile" className="h-16 w-16 rounded-full object-cover border-2 border-border/60" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary border-2 border-border/60">
                    {userDisplayName?.[0] || "S"}
                  </div>
                )}
                <div>
                  <p className="text-lg font-semibold">{userDisplayName || "Seller User"}</p>
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

            <div className="rounded-2xl border border-border/60 bg-background/70 p-4" id="settings">
              <p className="font-medium">Shop Settings</p>
              <p className="text-sm text-muted-foreground">Manage business details and payment methods.</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/70 p-4" id="support">
              <p className="font-medium">Support & Help</p>
              <p className="text-sm text-muted-foreground">Contact admin and get help with your shop.</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/70 p-4" id="reviews">
              <p className="font-medium">Reviews & Ratings</p>
              <p className="text-sm text-muted-foreground">Manage customer feedback for your products.</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/70 p-4" id="customers">
              <p className="font-medium">Customer List</p>
              <p className="text-sm text-muted-foreground">View and interact with your buyers.</p>
            </div>
          </div>
        </motion.section>
      </RoleDashboardShell>
    </>
  );
}
