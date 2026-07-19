"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { useAuth, useCart } from "@/hooks";
import { Navbar } from "@/components/navbar";

export default function CartPage() {
  const { initializeAuth, isAuthenticated } = useAuth();
  const { items, total, isLoading, error, fetchCart, removeFromCart, updateCartItem } = useCart();
  const [coupon, setCoupon] = useState("");

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const shipping = total > 500 ? 0 : 25;
  const tax = total * 0.1;
  const grandTotal = total + shipping + tax;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/products" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Continue shopping
        </Link>

        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Cart</p>
            <h1 className="text-4xl font-semibold tracking-tight">Review your order</h1>
          </div>
          <div className="rounded-full border border-border/60 bg-card/80 px-4 py-2 text-sm text-muted-foreground">
            {items?.length || 0} items in cart
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
        ) : null}

        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : items && items.length > 0 ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-4">
              {items.map((item) => {
                const name = item.product?.name ?? item.productName ?? "Product";
                const price = item.product?.discountPrice ?? item.product?.price ?? item.price ?? 0;
                const brand = item.product?.brandName ?? item.product?.vendorName ?? "Verified seller";
                const imageUrl = item.product?.images?.find(i => i.isPrimary)?.url
                  ?? item.product?.images?.[0]?.url
                  ?? item.productImageUrl;
                return (
                  <div key={item.id} className="rounded-[28px] border border-border/60 bg-card/80 p-5 shadow-sm">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      {imageUrl
                        ? <img src={imageUrl} alt={name} className="h-24 w-24 rounded-3xl object-cover" />
                        : <div className="h-24 w-24 rounded-3xl bg-muted/40" />}
                      <div className="flex-1">
                        <p className="text-lg font-semibold">{name}</p>
                        <p className="text-sm text-muted-foreground">{brand}</p>
                        <p className="mt-2 text-sm text-muted-foreground">${Number(price).toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => updateCartItem(item.id, Math.max(1, item.quantity - 1))} className="h-10 w-10 rounded-full border border-border/60">-</button>
                        <span className="min-w-8 text-center font-medium">{item.quantity}</span>
                        <button onClick={() => updateCartItem(item.id, item.quantity + 1)} className="h-10 w-10 rounded-full border border-border/60">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive">
                        <Trash2 className="h-4 w-4" /> Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="space-y-4 rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Order summary</h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
                <div className="flex items-center justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span></div>
                <div className="flex items-center justify-between"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
              </div>

              <div className="rounded-3xl border border-border/60 bg-muted/30 p-4">
                <label className="text-sm font-medium">Coupon code</label>
                <div className="mt-3 flex gap-2">
                  <input value={coupon} onChange={(event) => setCoupon(event.target.value)} className="h-11 flex-1 rounded-2xl border border-border/60 bg-background px-4 text-sm outline-none" placeholder="Enter coupon" />
                  <button className="h-11 rounded-2xl border border-border/60 px-4 text-sm font-medium">Apply</button>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-4 text-lg font-semibold">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>

              <Link href="/checkout" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20">
                Checkout <ArrowRight className="h-4 w-4" />
              </Link>

              <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" /> Secure payments and protected checkout
              </div>
            </aside>
          </div>
        ) : (
          <div className="mt-8 rounded-[32px] border border-border/60 bg-card/80 p-10 text-center shadow-sm">
            <ShoppingBag className="mx-auto h-14 w-14 text-muted-foreground" />
            <h2 className="mt-4 text-2xl font-semibold">Your cart is empty</h2>
            <p className="mt-2 text-sm text-muted-foreground">Add products to start building your order.</p>
            <Link href="/products" className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground">
              Browse products
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
