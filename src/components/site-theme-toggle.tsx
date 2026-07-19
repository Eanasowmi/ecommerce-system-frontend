"use client";

import { Monitor, MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const themeConfig: Record<
  Theme,
  { label: string; next: Theme; icon: React.ReactNode }
> = {
  light: {
    label: "Light",
    next: "dark",
    icon: <SunMedium className="h-4 w-4" />,
  },
  dark: {
    label: "Dark",
    next: "system",
    icon: <MoonStar className="h-4 w-4" />,
  },
  system: {
    label: "System",
    next: "light",
    icon: <Monitor className="h-4 w-4" />,
  },
};

export function SiteThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const current = (theme as Theme) ?? "system";
  const config = themeConfig[current] ?? themeConfig.system;

  const handleToggle = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTheme(config.next);
    setTimeout(() => setIsAnimating(false), 350);
  };

  if (!mounted) {
    return (
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/80" />
    );
  }

  return (
    <div className="relative group">
      <button
        type="button"
        id="theme-toggle-btn"
        onClick={handleToggle}
        aria-label={`Switch to ${config.next} mode`}
        className={[
          "inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300",
          "border-border/60 bg-background/80 text-foreground shadow-sm backdrop-blur",
          "hover:border-primary/40 hover:bg-primary/10 hover:text-primary hover:shadow-md hover:shadow-primary/10",
          "active:scale-95",
          isAnimating ? "scale-90 opacity-70" : "scale-100 opacity-100",
        ].join(" ")}
      >
        <span
          key={current}
          style={{
            display: "inline-flex",
            animation: isAnimating
              ? "theme-icon-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
              : "none",
          }}
        >
          {config.icon}
        </span>
      </button>

      {/* Tooltip */}
      <div
        className={[
          "pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2",
          "whitespace-nowrap rounded-lg border border-border/60 bg-popover px-2.5 py-1",
          "text-[11px] font-medium text-muted-foreground shadow-md",
          "opacity-0 scale-95 transition-all duration-200",
          "group-hover:opacity-100 group-hover:scale-100",
        ].join(" ")}
      >
        {config.label}
        <span className="ml-1 text-primary/60">→ {config.next}</span>
        <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-border/60" />
      </div>

      <style>{`
        @keyframes theme-icon-in {
          from { opacity: 0; transform: rotate(-30deg) scale(0.7); }
          to   { opacity: 1; transform: rotate(0deg) scale(1); }
        }
      `}</style>
    </div>
  );
}
