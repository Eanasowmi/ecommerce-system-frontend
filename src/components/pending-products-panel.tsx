"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks";
import { productApi } from "@/lib/api-client";
import type { ProductDto } from "@/types";

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }
  return fallback;
}

export function PendingProductsPanel() {
  const { initializeAuth, isAuthenticated, isAdmin, user } = useAuth();
  const [pendingProducts, setPendingProducts] = useState<ProductDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState("");

  const loadPendingProducts = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) {
      setPendingProducts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const response = await productApi.getPendingProducts(0, 50);
      const data = response.data as { content?: ProductDto[] };
      setPendingProducts(data.content || []);
    } catch (err) {
      setPendingProducts([]);
      setError(getErrorMessage(err, "Failed to load pending products."));
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    void loadPendingProducts();
  }, [loadPendingProducts]);

  const approveProduct = async (productId: string) => {
    setIsApproving(true);
    setError("");
    try {
      const response = await productApi.approveProduct(productId);
      const updatedProduct = response.data as ProductDto;
      setPendingProducts((current) => current.filter((product) => product.id !== updatedProduct.id));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to approve product."));
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Seller submissions stay hidden from the storefront until approved here.
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!isAdmin || isLoading}
          onClick={() => void loadPendingProducts()}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {!isAuthenticated ? (
        <div className="rounded-2xl border border-border/60 bg-background/70 p-5 text-sm text-muted-foreground">
          Sign in with an admin account to review seller products.{" "}
          <Link href="/auth/login" className="font-medium text-primary">
            Go to login
          </Link>
        </div>
      ) : null}

      {isAuthenticated && !isAdmin ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-sm text-amber-700 dark:text-amber-300">
          You are signed in as {user?.email}. Log out and sign in with{" "}
          <span className="font-medium">admin@luxeshop.com</span> to approve products.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-border/60">
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
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading pending products...
                  </span>
                </td>
              </tr>
            ) : pendingProducts.length ? (
              pendingProducts.map((product) => (
                <tr key={product.id} className="transition hover:bg-muted/40">
                  <td className="px-5 py-4 font-medium">{product.name}</td>
                  <td className="px-5 py-4 text-muted-foreground">{product.vendorName || "Unknown"}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-medium text-amber-600">Pending</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isApproving}
                      onClick={() => void approveProduct(product.id)}
                    >
                      Approve
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                  {isAdmin ? "No pending products to review." : "Admin access required."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
