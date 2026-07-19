"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, Download, Package, Truck, Loader2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { orderApi } from "@/lib/api-client";
import type { OrderDto } from "@/types";

const timeline = [
  { title: "Order placed", icon: Clock, completed: true },
  { title: "Packed", icon: Package, completed: true },
  { title: "Shipped", icon: Truck, completed: true },
  { title: "Delivered", icon: CheckCircle2, completed: true },
];

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!params.id) {
      router.push("/orders");
      return;
    }

    async function fetchOrder() {
      try {
        const response = await orderApi.getOrderById(params.id as string);
        setOrder(response.data as OrderDto);
      } catch (error) {
        console.error("Failed to fetch order", error);
        router.push("/orders");
      } finally {
        setIsLoading(false);
      }
    }

    void fetchOrder();
  }, [params.id, router]);

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      setIsCancelling(true);
      const response = await orderApi.cancelOrder(order.id);
      setOrder(response.data as OrderDto);
      alert("Order cancelled successfully");
    } catch (error: any) {
      console.error("Failed to cancel order", error);
      alert(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!order) return;
    if (!confirm("Are you sure you want to permanently delete this order?")) return;

    try {
      setIsDeleting(true);
      await orderApi.deleteOrder(order.id);
      alert("Order deleted successfully");
      router.push("/orders");
    } catch (error: any) {
      console.error("Failed to delete order", error);
      alert(error.response?.data?.message || "Failed to delete order");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/orders" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="space-y-6 rounded-[36px] border border-border/60 bg-card/80 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </p>
                <h1 className="text-3xl font-semibold tracking-tight">{order.orderNumber || order.id.slice(0, 8)}</h1>
              </div>
              <div className="rounded-full border border-border/60 px-3 py-1 text-sm font-medium">{order.status}</div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Payment", order.paymentStatus || "N/A"],
                ["Total", `$${order.totalAmount.toFixed(2)}`],
                ["Shipping", order.shippingAddress || "N/A"],
                ...(order.status === "SHIPPED" && order.estimatedDeliveryDays 
                  ? [["Estimated Delivery", `${order.estimatedDeliveryDays} days`]] 
                  : [])
              ].map(([label, value]) => (
                <div key={label as string} className="rounded-3xl border border-border/60 bg-background/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label as string}</p>
                  <p className="mt-2 font-semibold">{value as string}</p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
              <h2 className="font-semibold">Items</h2>
              <div className="mt-4 space-y-3">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl border border-border/60 p-4">
                    <div>
                      <p className="font-medium">{item.productName || item.product?.name || "Unknown Product"}</p>
                      <p className="text-sm text-muted-foreground">Qty {item.quantity}</p>
                      {item.sellerPhone && (
                        <p className="text-xs text-muted-foreground mt-1">Seller Phone: {item.sellerPhone}</p>
                      )}
                    </div>
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Order summary</h2>
                <div className="flex items-center gap-2">
                  {order.status !== "SHIPPED" && order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                    <button 
                      onClick={handleCancelOrder}
                      disabled={isCancelling || isDeleting}
                      className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                    >
                      {isCancelling ? "Cancelling..." : "Cancel Order"}
                    </button>
                  )}
                  {order.status !== "SHIPPED" && order.status !== "DELIVERED" && (
                    <button 
                      onClick={handleDeleteOrder}
                      disabled={isDeleting || isCancelling}
                      className="inline-flex items-center gap-2 rounded-2xl bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                    >
                      {isDeleting ? "Deleting..." : "Delete Order"}
                    </button>
                  )}
                  <button className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                    <Download className="h-4 w-4" /> Invoice
                  </button>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between font-semibold text-foreground"><span>Total</span><span>${order.totalAmount.toFixed(2)}</span></div>
              </div>
            </div>
          </section>

          <aside className="space-y-4 rounded-[36px] border border-border/60 bg-card/80 p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Timeline</h2>
            <div className="space-y-4">
              {timeline.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="flex gap-4 rounded-3xl border border-border/60 bg-background/70 p-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${step.completed ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{step.title}</p>
                      <p className="text-sm text-muted-foreground">Tracking event logged</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

