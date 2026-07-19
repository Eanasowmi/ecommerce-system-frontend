"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid2x2,
  Heart,
  List,
  Loader2,
  Search,
  Star,
  ShoppingCart,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { brandApi, categoryApi, productApi, wishlistApi } from "@/lib/api-client";
import type { BrandDto, CategoryDto, ProductDto, WishlistItemDto } from "@/types";
import { useCart } from "@/hooks";

function productImage(product: ProductDto) {
  return product.images?.find((image) => image.isPrimary || image.primary)?.url
    || product.images?.[0]?.url
    || "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=900";
}

function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("auth");
}

function redirectToLogin() {
  window.location.href = "/auth/login";
}

function ProductCard({
  product,
  isLiked = false,
  onLike,
}: {
  product: ProductDto;
  isLiked?: boolean;
  onLike?: (product: ProductDto) => void;
}) {
  const price = product.discountPrice ?? product.price;
  const { addToCart, isLoading } = useCart();

  return (
    <motion.div whileHover={{ y: -6 }} className="group overflow-hidden rounded-[28px] border border-border/60 bg-card/80 shadow-sm transition hover:shadow-xl hover:shadow-slate-950/10">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[4/3] bg-muted/30">
          <div className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${productImage(product)})` }} />
          <div className="absolute left-4 top-4 rounded-full bg-background/85 px-3 py-1 text-xs font-semibold">{product.stockQuantity > 0 ? "In stock" : "Out of stock"}</div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isLoggedIn()) { redirectToLogin(); return; }
              onLike?.(product);
            }}
            className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-lg transition opacity-0 group-hover:opacity-100 ${isLiked ? "text-red-500" : "text-foreground"}`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          </button>
        </div>
      </Link>
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span>{product.categoryName || "Catalog"}</span>
          <span>{product.stockQuantity} left</span>
        </div>
        <Link href={`/products/${product.id}`}>
          <h3 className="text-lg font-semibold tracking-tight transition group-hover:text-primary">{product.name}</h3>
        </Link>
        <p className="text-sm text-muted-foreground">Seller: {product.vendorName || "Verified seller"}</p>
        <div className="flex items-center gap-1 text-sm">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="font-medium">No ratings yet</span>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-semibold">${price.toFixed(2)}</p>
            {product.discountPrice ? <p className="text-sm text-muted-foreground line-through">${product.price.toFixed(2)}</p> : null}
          </div>
          <Button
            size="icon"
            className="h-11 w-11 rounded-full"
            disabled={product.stockQuantity <= 0 || isLoading}
            onClick={(e) => {
              e.preventDefault();
              if (!isLoggedIn()) { redirectToLogin(); return; }
              void addToCart(product.id, 1);
            }}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [brands, setBrands] = useState<BrandDto[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart, isLoading: isCartLoading } = useCart();

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      setError("");
      try {
        const [productsResponse, categoriesResponse, brandsResponse] = await Promise.all([
          productApi.getAllProducts(0, 100),
          categoryApi.getAllCategories(),
          brandApi.getAllBrands(),
        ]);
        const data = productsResponse.data as { content?: ProductDto[] };
        setProducts(data.content || []);
        setCategories(categoriesResponse.data as CategoryDto[]);
        setBrands(brandsResponse.data as BrandDto[]);
      } catch {
        setError("Failed to load products.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProducts();

    const auth = localStorage.getItem("auth");
    if (auth) {
      wishlistApi.getWishlist().then((res) => {
        const ids = new Set((res.data as WishlistItemDto[]).map((w) => w.productId));
        setWishlistIds(ids);
      }).catch(console.error);
    }
  }, []);

  const handleLike = (product: ProductDto) => {
    if (!isLoggedIn()) { redirectToLogin(); return; }

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

  const filteredProducts = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    let results = products.filter((product) => {
      const matchesSearch = !normalized || [
        product.name,
        product.vendorName,
        product.categoryName,
        product.brandName,
        product.sku,
      ].some((value) => (value || "").toLowerCase().includes(normalized));

      return matchesSearch
        && (!categoryId || product.categoryId === categoryId)
        && (!brandId || product.brandId === brandId);
    });

    if (sort === "price-low") {
      results = [...results].sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
    } else if (sort === "price-high") {
      results = [...results].sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
    }

    return results;
  }, [brandId, categoryId, products, search, sort]);

  const pageSize = view === "grid" ? 6 : 4;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="border-b border-border/60 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary">Product listing</p>
              <h1 className="text-4xl font-semibold tracking-tight">Search marketplace products</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Every active product added by sellers appears here for customers to browse.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background px-4 py-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              Live catalog
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="space-y-6 rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Search</h2>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search products, sellers..."
                className="h-12 w-full rounded-2xl border border-border/60 bg-background pl-10 pr-4 text-sm outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Category</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <label className="flex items-center gap-3 rounded-2xl border border-border/60 px-4 py-3 transition hover:bg-muted/40">
                <input
                  type="radio"
                  name="category"
                  checked={!categoryId}
                  onChange={() => {
                    setCategoryId("");
                    setPage(1);
                  }}
                  className="h-4 w-4"
                />
                All
              </label>
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-3 rounded-2xl border border-border/60 px-4 py-3 transition hover:bg-muted/40">
                  <input
                    type="radio"
                    name="category"
                    checked={categoryId === category.id}
                    onChange={() => {
                      setCategoryId(category.id);
                      setPage(1);
                    }}
                    className="h-4 w-4"
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Brand</h2>
            <select
              value={brandId}
              onChange={(event) => {
                setBrandId(event.target.value);
                setPage(1);
              }}
              className="h-12 w-full rounded-2xl border border-border/60 bg-background px-4 text-sm outline-none"
            >
              <option value="">All brands</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>
        </aside>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 rounded-[32px] border border-border/60 bg-card/80 p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-2 text-sm text-muted-foreground">
              <ArrowLeftRight className="h-4 w-4" />
              {filteredProducts.length} products available
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-full border border-border/60 bg-background p-1">
                <button
                  onClick={() => {
                    setView("grid");
                    setPage(1);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  <Grid2x2 className="mr-2 inline-block h-4 w-4" /> Grid
                </button>
                <button
                  onClick={() => {
                    setView("list");
                    setPage(1);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  <List className="mr-2 inline-block h-4 w-4" /> List
                </button>
              </div>
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  setPage(1);
                }}
                className="h-11 rounded-full border border-border/60 bg-background px-4 text-sm outline-none"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {error ? <p className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{error}</p> : null}

          {isLoading ? (
            <div className="rounded-[28px] border border-border/60 bg-card/80 p-12 text-center text-muted-foreground">
              <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
              Loading products
            </div>
          ) : view === "grid" ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {currentProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isLiked={wishlistIds.has(product.id)}
                  onLike={handleLike}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {currentProducts.map((product) => (
                <div key={product.id} className="grid gap-4 rounded-[28px] border border-border/60 bg-card/80 p-4 shadow-sm sm:grid-cols-[180px_1fr_auto] sm:items-center">
                  <div className="aspect-[4/3] rounded-2xl bg-cover bg-center relative" style={{ backgroundImage: `url(${productImage(product)})` }}>
                    <button
                      onClick={() => {
                        if (!isLoggedIn()) { redirectToLogin(); return; }
                        handleLike(product);
                      }}
                      className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 shadow-lg ${wishlistIds.has(product.id) ? "text-red-500" : "text-foreground"}`}
                    >
                      <Heart className={`h-4 w-4 ${wishlistIds.has(product.id) ? "fill-current" : ""}`} />
                    </button>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{product.categoryName || "Catalog"}</p>
                    <h3 className="mt-2 text-xl font-semibold">{product.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Seller: {product.vendorName || "Verified seller"}</p>
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <div className="text-right">
                      <p className="text-2xl font-semibold">${(product.discountPrice ?? product.price).toFixed(2)}</p>
                      {product.discountPrice ? <p className="text-sm text-muted-foreground line-through">${product.price.toFixed(2)}</p> : null}
                    </div>
                    <Button
                      size="icon"
                      className="h-11 w-11 rounded-full"
                      disabled={product.stockQuantity <= 0 || isCartLoading}
                      onClick={() => {
                        if (!isLoggedIn()) { redirectToLogin(); return; }
                        void addToCart(product.id, 1);
                      }}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && !currentProducts.length ? (
            <div className="rounded-[28px] border border-dashed border-border/70 bg-card/60 p-12 text-center text-muted-foreground">
              No products found.
            </div>
          ) : null}

          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).slice(0, 5).map((pageNumber) => (
              <Button key={pageNumber} variant={pageNumber === page ? "default" : "outline"} size="icon" className="h-10 w-10" onClick={() => setPage(pageNumber)}>
                {pageNumber}
              </Button>
            ))}
            <Button variant="outline" size="icon" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
