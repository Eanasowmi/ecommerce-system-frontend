import Link from "next/link";
import { ArrowUpRight, Globe, Mail, MessageCircle } from "lucide-react";

const footerLinks = {
  Shop: ["Products", "Categories", "Best Sellers", "Flash Sale"],
  Company: ["About", "Careers", "Press", "Contact"],
  Support: ["Help Center", "Shipping", "Returns", "Privacy"],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <span className="text-sm font-semibold">LX</span>
              </div>
              <div>
                <p className="text-lg font-semibold">LuxeShop</p>
                <p className="text-sm text-muted-foreground">Marketplace and dashboard system</p>
              </div>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              A premium multi-vendor commerce experience inspired by the clarity of Stripe and the scale of Amazon.
            </p>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Link href="#" className="rounded-full border border-border/60 p-2 transition hover:bg-muted"><Globe className="h-4 w-4" /></Link>
              <Link href="#" className="rounded-full border border-border/60 p-2 transition hover:bg-muted"><Mail className="h-4 w-4" /></Link>
              <Link href="#" className="rounded-full border border-border/60 p-2 transition hover:bg-muted"><MessageCircle className="h-4 w-4" /></Link>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, items]) => (
            <div key={title} className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">{title}</h3>
              <ul className="space-y-3 text-sm text-foreground/80">
                {items.map((item) => (
                  <li key={item}>
                    <Link href="#" className="group inline-flex items-center gap-1 transition hover:text-primary">
                      {item}
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border/60 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 LuxeShop. Built for premium commerce operations.</p>
          <div className="flex items-center gap-5">
            <Link href="#">Terms</Link>
            <Link href="#">Privacy</Link>
            <Link href="#">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
