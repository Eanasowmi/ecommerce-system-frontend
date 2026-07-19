"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, ArrowLeft, ArrowRight, CreditCard, MapPin, PackageCheck, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useAuth, useCart, useOrders } from "@/hooks";
import { StripePaymentWrapper } from "@/components/stripe-payment-element";

const steps = [
  { title: "Shipping Address", icon: MapPin },
  { title: "Payment Method", icon: CreditCard },
  { title: "Order Review", icon: PackageCheck },
  { title: "Payment", icon: CreditCard },
  { title: "Order Success", icon: CheckCircle2 },
];

export default function CheckoutPage() {
  const { initializeAuth } = useAuth();
  const { items: cartItems, total } = useCart();
  const { checkout, isLoading: isProcessing } = useOrders();
  const [currentStep, setCurrentStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");
  const [createdOrderId, setCreatedOrderId] = useState("");

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const shipping = total > 500 ? 0 : 25;
  const tax = total * 0.1;

  const handleCheckout = async () => {
    const res = await checkout(paymentMethod, shippingAddress);
    if (res.success && res.order) {
      if (paymentMethod === "CREDIT_CARD") {
        setCreatedOrderId(res.order.id);
        setCurrentStep(4); // Move to Payment step
      } else {
        setSuccess(true);
      }
    } else {
      alert("Checkout failed. Please try again.");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto flex max-w-3xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="w-full rounded-[36px] border border-border/60 bg-card/90 p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight">Order confirmed</h1>
            <p className="mt-3 text-sm text-muted-foreground">Your order has been received and is being processed.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link href="/orders" className="inline-flex h-12 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
                View orders
              </Link>
              <Link href="/products" className="inline-flex h-12 items-center justify-center rounded-2xl border border-border/60 text-sm font-semibold">
                Continue shopping
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/cart" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to cart
        </Link>

        <div className="mt-6">
          <p className="text-sm font-medium text-primary">Checkout</p>
          <h1 className="text-4xl font-semibold tracking-tight">Complete your purchase</h1>
        </div>

        <div className="mt-8 grid gap-3 lg:grid-cols-5">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const active = currentStep === index + 1;
            const completed = currentStep > index + 1;
            return (
              <div key={step.title} className={`rounded-[28px] border p-4 ${active ? "border-primary bg-primary/5" : "border-border/60 bg-card/80"}`}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${completed ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                    {completed ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Step {index + 1}</p>
                    <p className="font-medium">{step.title}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm">
            {currentStep === 1 ? (
              <div className="space-y-5">
                <h2 className="text-2xl font-semibold">Shipping address</h2>
                <textarea value={shippingAddress} onChange={(event) => setShippingAddress(event.target.value)} placeholder="Enter your shipping address" className="min-h-32 w-full rounded-3xl border border-border/60 bg-background p-4 outline-none" />
                <button onClick={() => setCurrentStep(2)} disabled={!shippingAddress.trim()} className="inline-flex h-12 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : null}

            {currentStep === 2 ? (
              <div className="space-y-5">
                <h2 className="text-2xl font-semibold">Payment method</h2>
                {[
                  ["CREDIT_CARD", "Credit / Debit Card"],
                  ["CASH_ON_DELIVERY", "Cash on Delivery"],
                ].map(([value, label]) => (
                  <label key={value} className={`flex items-center justify-between rounded-3xl border p-4 ${paymentMethod === value ? "border-primary bg-primary/5" : "border-border/60 bg-background/70"}`}>
                    <span>
                      <p className="font-medium">{label}</p>
                      <p className="text-sm text-muted-foreground">A secure and reliable payment path</p>
                    </span>
                    <input type="radio" checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} />
                  </label>
                ))}
                <div className="flex gap-3">
                  <button onClick={() => setCurrentStep(1)} className="inline-flex h-12 items-center justify-center rounded-2xl border border-border/60 px-5 text-sm font-semibold">
                    Back
                  </button>
                  <button onClick={() => setCurrentStep(3)} className="inline-flex h-12 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground">
                    Review <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : null}

            {currentStep === 3 ? (
              <div className="space-y-5">
                <h2 className="text-2xl font-semibold">Order review</h2>

                {/* Cart Items */}
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">Items in your order</p>
                  <div className="space-y-2 rounded-3xl border border-border/60 bg-background/70 p-4">
                    {cartItems.map((item) => {
                      const name = item.product?.name ?? item.productName ?? "—";
                      const price = item.product?.discountPrice ?? item.product?.price ?? item.price ?? 0;
                      const imageUrl = item.product?.images?.find(i => i.isPrimary)?.url
                        ?? item.product?.images?.[0]?.url
                        ?? item.productImageUrl;
                      return (
                        <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
                          <div className="flex items-center gap-3">
                            {imageUrl && (
                              <img
                                src={imageUrl}
                                alt={name}
                                className="h-10 w-10 rounded-xl object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium">{name}</p>
                              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="font-semibold">${(Number(price) * item.quantity).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Summary info */}
                <div className="space-y-3 rounded-3xl border border-border/60 bg-background/70 p-4 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping address</span><span className="font-medium max-w-[55%] text-right">{shippingAddress || "Not provided"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Payment method</span><span className="font-medium">{paymentMethod === "CREDIT_CARD" ? "Credit / Debit Card" : "Cash on Delivery"}</span></div>
                  <div className="flex justify-between border-t border-border/40 pt-3"><span className="text-muted-foreground">Order total</span><span className="font-bold text-base">${(total + shipping + tax).toFixed(2)}</span></div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setCurrentStep(2)} className="inline-flex h-12 items-center justify-center rounded-2xl border border-border/60 px-5 text-sm font-semibold">
                    Back
                  </button>
                  <button onClick={handleCheckout} disabled={isProcessing} className="inline-flex h-12 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Place order
                  </button>
                </div>
              </div>
            ) : null}

            {currentStep === 4 ? (
              <div className="space-y-5">
                <h2 className="text-2xl font-semibold">Complete Payment</h2>
                <div className="rounded-3xl border border-border/60 bg-background/70 p-6">
                   <StripePaymentWrapper 
                     orderId={createdOrderId} 
                     onSuccess={() => setSuccess(true)} 
                   />
                </div>
              </div>
            ) : null}
          </div>

          <aside className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm">
            <h3 className="text-xl font-semibold">Summary</h3>
            <div className="mt-5 space-y-3 border-b border-border/60 pb-4 text-sm text-muted-foreground">
              {cartItems.map((item) => {
                const name = item.product?.name ?? item.productName ?? "—";
                const price = item.product?.discountPrice ?? item.product?.price ?? item.price ?? 0;
                return (
                  <div key={item.id} className="flex justify-between gap-4">
                    <span>{name} x{item.quantity}</span>
                    <span>${(Number(price) * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <div className="flex justify-between"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4 text-lg font-semibold">
              <span>Total</span>
              <span>${(total + shipping + tax).toFixed(2)}</span>
            </div>
            <div className="mt-5 rounded-3xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
              <ShieldCheck className="mb-2 h-5 w-5 text-primary" />
              Secure checkout with order review and protected payment capture.
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
