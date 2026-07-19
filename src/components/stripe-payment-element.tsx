"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";

// Initialize Stripe outside of component to avoid recreating it on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

export function StripeCheckoutForm({ orderId, onSuccess }: { orderId: string, onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);
    setErrorMessage("");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // This is a dummy URL since we don't actually want to redirect away in this flow,
        // we'll handle the success inline by providing redirect: 'if_required'
      },
      redirect: "if_required"
    });

    if (error) {
      setErrorMessage(error.message || "An unexpected error occurred.");
      setIsLoading(false);
    } else {
      // Payment successful
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {errorMessage && <div className="text-sm text-destructive">{errorMessage}</div>}
      <button 
        disabled={!stripe || isLoading}
        className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Pay now"}
      </button>
    </form>
  );
}

export function StripePaymentWrapper({ orderId, onSuccess }: { orderId: string, onSuccess: () => void }) {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    apiClient.post("/payments/create-payment-intent", { orderId })
      .then((res: any) => setClientSecret(res.data.clientSecret))
      .catch((err) => console.error("Error creating payment intent", err));
  }, [orderId]);

  if (!clientSecret) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripeCheckoutForm orderId={orderId} onSuccess={onSuccess} />
    </Elements>
  );
}
