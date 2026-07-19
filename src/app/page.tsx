"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgePercent,
  CheckCircle2,
  Heart,
  Search,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";
import {
  brandLogos,
  customerReviews,
  featuredCategories,
  heroSlides,
  marketplaceMetrics,
} from "@/lib/commerce-data";
import { productApi, wishlistApi } from "@/lib/api-client";
import type { ProductDto, WishlistItemDto } from "@/types";
import { useCart } from "@/hooks";

function ProductTile({ 
  product,
  isLiked = false,
  onLike,
}: { 
  product: ProductDto;
  isLiked?: boolean;
  onLike?: (product: ProductDto) => void;
}) {
  const imageUrl = product.images?.find((i) => i.isPrimary)?.url || product.images?.[0]?.url || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1200&auto=format&fit=crop";
  const badge = product.discountPrice ? `-${Math.round((1 - product.discountPrice / product.price) * 100)}%` : "Trending";
  const stockStr = product.stockQuantity > 0 ? (product.stockQuantity < 10 ? "Low stock" : "In stock") : "Out of stock";
  const { addToCart, isLoading } = useCart();

  return (
    <div className="group overflow-hidden rounded-[28px] border border-border/60 bg-card/80 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/10">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
        <div className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${imageUrl})` }} />
        <div className="absolute left-4 top-4 rounded-full bg-background/85 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur">
          {badge}
        </div>
        <div className="absolute right-4 top-4 flex gap-2 opacity-0 transition group-hover:opacity-100">
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLike?.(product); }}
            className={`flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-lg ${isLiked ? 'text-red-500' : 'text-foreground'}`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button 
            disabled={product.stockQuantity <= 0 || isLoading}
            onClick={(e) => { e.preventDefault(); addToCart(product.id, 1); }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <span>{product.categoryName || "Category"}</span>
          <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">{stockStr}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{product.name}</h3>
          <p className="text-sm text-muted-foreground">{product.vendorName || "Seller"}</p>
        </div>
        <div className="flex items-center gap-1 text-sm text-foreground">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="font-medium">4.5</span>
          <span className="text-muted-foreground">(43)</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-semibold">${(product.discountPrice ?? product.price).toFixed(2)}</p>
            {product.discountPrice && (
              <p className="text-sm text-muted-foreground line-through">${product.price.toFixed(2)}</p>
            )}
          </div>
          <Link href={`/products/${product.id}`} className="rounded-full border border-border/60 px-4 py-2 text-sm font-medium transition hover:bg-muted">
            Quick view
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [realProducts, setRealProducts] = useState<ProductDto[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    productApi.searchProducts("", 0, 12).then((res) => {
      setRealProducts((res.data as any).content || []);
    }).catch(console.error);

    const auth = localStorage.getItem("auth");
    if (auth) {
      wishlistApi.getWishlist().then((res) => {
        const ids = new Set((res.data as WishlistItemDto[]).map((w) => w.productId));
        setWishlistIds(ids);
      }).catch(console.error);
    }
  }, []);

  const handleLike = (product: ProductDto) => {
    const auth = localStorage.getItem("auth");
    if (!auth) {
      alert("Please login to add to wishlist");
      return;
    }
    
    if (wishlistIds.has(product.id)) {
      wishlistApi.removeFromWishlist(product.id).then(() => {
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(product.id);
          return next;
        });
      }).catch(console.error);
    } else {
      wishlistApi.addToWishlist(product.id).then(() => {
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.add(product.id);
          return next;
        });
      }).catch(console.error);
    }
  };

  const slide = heroSlides[activeSlide];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.08),_transparent_28%)]" />
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
            <div className="relative z-10 space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {slide.badge}
              </span>
              <div className="space-y-5 max-w-2xl">
                <p className="text-sm font-medium text-primary">{slide.eyebrow}</p>
                <h1 className="text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">{slide.title}</h1>
                <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">{slide.copy}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/products" className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20">
                  Shop now <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/seller" className="inline-flex h-12 items-center gap-2 rounded-full border border-border/60 px-6 text-sm font-semibold transition hover:bg-muted">
                  Become a seller <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {marketplaceMetrics.map((metric) => (
                  <div key={metric.label} className="rounded-[28px] border border-border/60 bg-card/80 p-5 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{metric.label}</p>
                    <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{metric.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 flex items-stretch">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.title}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.45 }}
                  className="flex w-full flex-col overflow-hidden rounded-[36px] border border-border/60 bg-card/90 shadow-[0_20px_80px_-24px_rgba(15,23,42,0.35)]"
                >
                  <div className="relative aspect-[5/4] bg-muted/40">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.image})` }} />
                    <div className="absolute inset-0 bg-gradient-to-tr from-background/80 via-background/20 to-transparent" />
                  </div>
                  <div className="grid gap-4 border-t border-border/60 p-5 sm:grid-cols-2">
                    {featuredCategories.slice(0, 4).map((category) => (
                      <div key={category.name} className="rounded-3xl border border-border/60 bg-background/70 p-4">
                        <p className="text-sm font-semibold">{category.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{category.subtitle}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary">Featured categories</p>
              <h2 className="text-3xl font-semibold tracking-tight">Shop by collection</h2>
            </div>
            <Link href="/products" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
              Browse all categories <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featuredCategories.map((category) => (
              <Link key={category.name} href={category.href} className="group overflow-hidden rounded-[28px] border border-border/60 bg-card/80 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/10">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${category.image})` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />
                </div>
                <div className="space-y-2 p-5">
                  <h3 className="text-xl font-semibold">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y border-border/60 bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary">Trending products</p>
                <h2 className="text-3xl font-semibold tracking-tight">Best-in-class picks</h2>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background px-4 py-2 text-sm text-muted-foreground">
                <Search className="h-4 w-4" />
                Search, sort, and filter in the product listing page
              </div>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {realProducts.slice(0, 4).map((product) => (
                <ProductTile 
                  key={product.id} 
                  product={product} 
                  isLiked={wishlistIds.has(product.id)}
                  onLike={handleLike}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
          <div className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary">Flash sale</p>
                <h2 className="text-3xl font-semibold tracking-tight">Time-limited offers</h2>
              </div>
              <BadgePercent className="h-6 w-6 text-primary" />
            </div>
            <div className="mt-6 grid gap-4">
              {realProducts.slice(0, 3).map((deal) => {
                const imageUrl = deal.images?.find((i) => i.isPrimary)?.url || deal.images?.[0]?.url || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1200&auto=format&fit=crop";
                return (
                  <div key={deal.id} className="flex items-center gap-4 rounded-3xl border border-border/60 bg-background/70 p-4">
                    <div className="h-20 w-20 rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }} />
                    <div className="flex-1">
                      <p className="font-semibold">{deal.name}</p>
                      <p className="text-sm text-muted-foreground">Ends in 4h</p>
                    </div>
                    <p className="text-lg font-semibold">${(deal.discountPrice ?? deal.price).toFixed(2)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="text-xl font-semibold">Fast shipping and trust badges</h3>
                  <p className="text-sm text-muted-foreground">Smooth fulfillment, verified sellers, and premium support across every order.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ["Free returns", "30 days"],
                  ["Secure payments", "Stripe-level"],
                  ["Support", "24/7 live"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                    <p className="mt-2 font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm">
                <p className="text-sm font-medium text-primary">Best sellers</p>
                <div className="mt-4 space-y-4">
                  {realProducts.slice(0, 3).map((product) => {
                    const imageUrl = product.images?.find((i) => i.isPrimary)?.url || product.images?.[0]?.url || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1200&auto=format&fit=crop";
                    return (
                      <div key={product.id} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 p-3">
                        <div className="h-14 w-14 rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.vendorName || "Seller"}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm">
                <p className="text-sm font-medium text-primary">Recently added</p>
                <div className="mt-4 space-y-4">
                  {realProducts.slice(0, 3).map((product) => {
                    const imageUrl = product.images?.find((i) => i.isPrimary)?.url || product.images?.[0]?.url || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1200&auto=format&fit=crop";
                    return (
                      <div key={product.id} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 p-3">
                        <div className="h-14 w-14 rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.categoryName || "Category"}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm">
              <p className="text-sm font-medium text-primary">Customer reviews</p>
              <div className="mt-6 grid gap-4">
                {customerReviews.map((review) => (
                  <div key={review.name} className="rounded-3xl border border-border/60 bg-background/70 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">{review.name.charAt(0)}</div>
                      <div>
                        <p className="font-semibold">{review.name}</p>
                        <p className="text-sm text-muted-foreground">{review.role}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">{review.quote}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm">
              <p className="text-sm font-medium text-primary">Trusted by brands</p>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {brandLogos.map((brand) => (
                  <div key={brand} className="flex h-24 items-center justify-center rounded-3xl border border-border/60 bg-background/70 text-lg font-semibold tracking-[0.18em] text-muted-foreground">
                    {brand}
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-3xl border border-border/60 bg-muted/30 p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Weekly newsletter</p>
                    <p className="mt-1 text-sm text-muted-foreground">Get curated launches, vendor updates, and platform news.</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input className="h-12 flex-1 rounded-2xl border border-border/60 bg-background px-4 text-sm outline-none" placeholder="Email address" />
                  <button className="h-12 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20">Subscribe</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
