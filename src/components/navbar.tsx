"use client";

import Link from "next/link";
import { useAuth } from "@/hooks";
import { useCart } from "@/hooks";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, LogOut, Menu, Search, ShoppingBag, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { SiteThemeToggle } from "@/components/site-theme-toggle";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { items: cartItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const cartCount = cartItems.length;
  const isSeller = Boolean(user?.roles?.includes("SELLER"));
  const isAdmin = Boolean(user?.roles?.includes("ADMIN") || user?.roles?.includes("SUPER_ADMIN"));

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center gap-4">
          <Link href="/" className="flex items-center gap-3 rounded-2xl px-2 py-1 transition hover:bg-muted">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-[0.18em] text-muted-foreground">LUXESHOP</p>
              <p className="text-base font-semibold">Marketplace</p>
            </div>
          </Link>

          <div className="hidden flex-1 items-center gap-3 lg:flex">
            <button className="inline-flex h-11 items-center gap-2 rounded-2xl border border-border/60 bg-background px-4 text-sm text-muted-foreground transition hover:bg-muted">
              Categories <ChevronDown className="h-4 w-4" />
            </button>
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-border/60 bg-background px-4 py-2 shadow-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                aria-label="Search products"
                placeholder="Search products, brands, vendors..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Link href="/products" className="rounded-2xl px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">
              Shop
            </Link>
            {isAuthenticated && isSeller ? (
              <Link href="/seller" className="rounded-2xl px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">
                Seller
              </Link>
            ) : null}
            {isAuthenticated && isAdmin ? (
              <Link href={user?.roles?.includes("SUPER_ADMIN") ? "/super-admin" : "/admin"} className="rounded-2xl px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">
                Admin
              </Link>
            ) : null}
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <SiteThemeToggle />
            {isAuthenticated ? (
              <>
                <Link href="/cart" className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 transition hover:bg-muted">
                  <ShoppingCart className="h-4 w-4" />
                  {cartCount > 0 ? (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  ) : null}
                </Link>
                
                <div className="hidden items-center gap-2 md:flex rounded-full border border-border/60 pl-1 pr-3 py-1 bg-muted/30">
                   {user?.profilePictureUrl ? (
                     <img src={user.profilePictureUrl} alt="Avatar" className="h-8 w-8 rounded-full object-cover" />
                   ) : (
                     <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs uppercase">
                       {user?.firstName?.[0] || 'U'}
                     </div>
                   )}
                   <span className="text-sm font-medium">{user?.firstName}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="hidden h-10 items-center gap-2 rounded-full border border-border/60 px-4 text-sm font-medium transition hover:bg-muted md:inline-flex"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link href="/auth/login" className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">
                  Login
                </Link>
                <Link href="/auth/register" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90">
                  Register
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsOpen((value) => !value)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 lg:hidden"
            >
              {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen ? (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-3 border-t border-border/60 py-4 lg:hidden"
            >
              <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background px-4 py-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input aria-label="Search products" placeholder="Search products..." className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Link href="/products" onClick={() => setIsOpen(false)} className="rounded-2xl border border-border/60 px-4 py-3 text-sm font-medium transition hover:bg-muted">Shop</Link>
                <Link href="/cart" onClick={() => setIsOpen(false)} className="rounded-2xl border border-border/60 px-4 py-3 text-sm font-medium transition hover:bg-muted">Cart ({cartCount})</Link>
                {!isAuthenticated ? (
                  <>
                    <Link href="/auth/login" onClick={() => setIsOpen(false)} className="rounded-2xl border border-border/60 px-4 py-3 text-sm font-medium transition hover:bg-muted">Login</Link>
                    <Link href="/auth/register" onClick={() => setIsOpen(false)} className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20">Register</Link>
                  </>
                ) : (
                  <>
                    <Link href="/customer" onClick={() => setIsOpen(false)} className="rounded-2xl border border-border/60 px-4 py-3 text-sm font-medium transition hover:bg-muted">Customer Dashboard</Link>
                    {isSeller ? <Link href="/seller" onClick={() => setIsOpen(false)} className="rounded-2xl border border-border/60 px-4 py-3 text-sm font-medium transition hover:bg-muted">Seller Dashboard</Link> : null}
                    {isAdmin ? <Link href={user?.roles?.includes("SUPER_ADMIN") ? "/super-admin" : "/admin"} onClick={() => setIsOpen(false)} className="rounded-2xl border border-border/60 px-4 py-3 text-sm font-medium transition hover:bg-muted">Admin Dashboard</Link> : null}
                    <button onClick={handleLogout} className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-left text-sm font-medium text-destructive">Logout</button>
                  </>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </nav>
  );
}
