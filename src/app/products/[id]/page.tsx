"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, Loader2, Minus, Plus, Share2, ShieldCheck, ShoppingCart, Star, Truck } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { productApi, wishlistApi } from "@/lib/api-client";
import type { ProductDto } from "@/types";
import { useCart, useAuth } from "@/hooks";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=900";

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { addToCart, isLoading: isAddingToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  useEffect(() => {
    setLoading(true);
    productApi.getProductById(id)
      .then((res) => setProduct(res.data as ProductDto))
      .catch(() => setError("Product not found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <p className="text-muted-foreground">{error || "Product not found."}</p>
          <Link href="/products" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to products
          </Link>
        </div>
      </div>
    );
  }

  const price = product.discountPrice ?? product.price;
  const discount = product.discountPrice ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;
  const gallery = product.images?.length ? product.images.map((img) => img.url) : [FALLBACK_IMAGE];

  const handleCartAction = () => {
    if (!isAuthenticated) {
      window.location.href = "/auth/login";
      return;
    }
    void addToCart(product.id, quantity);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      window.location.href = "/auth/login";
      return;
    }
    setIsBuyingNow(true);
    try {
      await addToCart(product.id, quantity);
      window.location.href = "/checkout";
    } catch {
      setIsBuyingNow(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/products" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to products
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-4">
            <div className="overflow-hidden rounded-[36px] border border-border/60 bg-card/80 shadow-sm">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="aspect-square bg-cover bg-center"
                  style={{ backgroundImage: `url(${gallery[activeImage]})` }}
                />
              </AnimatePresence>
              {discount ? <div className="absolute ml-6 mt-6 rounded-full bg-destructive px-3 py-1 text-xs font-semibold text-white">-{discount}%</div> : null}
            </div>
            {gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {gallery.map((img, index) => (
                  <button key={img + index} onClick={() => setActiveImage(index)} className={`overflow-hidden rounded-3xl border-2 ${activeImage === index ? "border-primary" : "border-transparent"}`}>
                    <div className="aspect-square bg-cover bg-center" style={{ backgroundImage: `url(${img})` }} />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-6 rounded-[36px] border border-border/60 bg-card/80 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary">{product.vendorName || "Verified seller"}</p>
                <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  className="rounded-full border border-border/60 p-3"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: product.name,
                        text: product.description,
                        url: window.location.href,
                      }).catch(console.error);
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Link copied to clipboard!");
                    }
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  className="rounded-full border border-border/60 p-3"
                  onClick={() => {
                    if (!isAuthenticated) { window.location.href = "/auth/login"; return; }
                    wishlistApi.addToWishlist(product.id)
                      .then(() => alert("Product added to wishlist!"))
                      .catch(() => alert("Could not add to wishlist."));
                  }}
                >
                  <Heart className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-1 rounded-full bg-muted/50 px-3 py-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> No ratings yet
              </div>
              {product.brandName && <div className="rounded-full bg-muted/50 px-3 py-1">{product.brandName}</div>}
              {product.categoryName && <div className="rounded-full bg-muted/50 px-3 py-1">{product.categoryName}</div>}
              <div className="rounded-full bg-primary/10 px-3 py-1 text-primary">{product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : "Out of stock"}</div>
            </div>

            <div className="flex items-end gap-3">
              <p className="text-4xl font-semibold">${price.toFixed(2)}</p>
              {product.discountPrice ? <p className="text-lg text-muted-foreground line-through">${product.price.toFixed(2)}</p> : null}
            </div>

            {product.description && <p className="text-sm leading-6 text-muted-foreground">{product.description}</p>}

            <div className="space-y-4">
              <div className="flex items-center rounded-full border border-border/60 bg-background p-1">
                <button onClick={() => setQuantity((c) => Math.max(1, c - 1))} className="rounded-full p-3"><Minus className="h-4 w-4" /></button>
                <span className="min-w-14 text-center text-sm font-semibold">{quantity}</span>
                <button onClick={() => setQuantity((c) => Math.min(product.stockQuantity || 99, c + 1))} className="rounded-full p-3"><Plus className="h-4 w-4" /></button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  className="h-12 rounded-2xl text-base font-semibold"
                  onClick={handleCartAction}
                  disabled={isAddingToCart || product.stockQuantity <= 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" /> Add to cart
                </Button>
                <Button
                  variant="outline"
                  className="h-12 rounded-2xl text-base font-semibold"
                  onClick={() => void handleBuyNow()}
                  disabled={isBuyingNow || product.stockQuantity <= 0}
                >
                  {isBuyingNow ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Buy now
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground"><Truck className="mb-2 h-5 w-5 text-primary" /> Free global delivery</div>
              <div className="rounded-3xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground"><ShieldCheck className="mb-2 h-5 w-5 text-primary" /> Secure payment protection</div>
            </div>
          </section>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[36px] border border-border/60 bg-card/80 shadow-sm">
            <div className="flex border-b border-border/60">
              {(["description", "specs", "reviews"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-4 text-sm font-semibold capitalize ${activeTab === tab ? "text-primary" : "text-muted-foreground"}`}>{tab}</button>
              ))}
            </div>
            <div className="p-6">
              {activeTab === "description" && (
                <div className="space-y-4 text-sm leading-6 text-muted-foreground">
                  <p>{product.description || "No description available."}</p>
                  {product.sku && <p>SKU: {product.sku}</p>}
                </div>
              )}
              {activeTab === "specs" && (
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  {[
                    ["Category", product.categoryName || "-"],
                    ["Brand", product.brandName || "-"],
                    ["SKU", product.sku || "-"],
                    ["Stock", String(product.stockQuantity)],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-3xl border border-border/60 bg-background/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
                      <p className="mt-2 font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "reviews" && (
                <div className="rounded-2xl border border-dashed border-border/60 bg-background/30 p-6 text-center text-sm text-muted-foreground">
                  No reviews yet for this product.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[36px] border border-border/60 bg-card/80 p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Related products</h2>
            <div className="mt-5 rounded-2xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
              Browse the <Link href="/products" className="text-primary hover:underline">product catalog</Link> to find similar items.
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
