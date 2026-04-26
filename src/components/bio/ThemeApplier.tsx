import type { Theme } from "@/lib/types";
import { useEffect } from "react";

const FONT_MAP: Record<string, string> = {
  "Space Grotesk": "'Space Grotesk', sans-serif",
  "JetBrains Mono": "'JetBrains Mono', monospace",
  "Orbitron": "'Orbitron', sans-serif",
  "Inter": "'Inter', sans-serif",
  "Bebas Neue": "'Bebas Neue', sans-serif",
};

export function ThemeApplier({ theme }: { theme: Theme }) {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--neon-primary", theme.primary);
    root.style.setProperty("--neon-secondary", theme.secondary);
    root.style.setProperty("--neon-accent", theme.accent);
    document.body.style.fontFamily = FONT_MAP[theme.font] || FONT_MAP["Space Grotesk"];
    return () => {
      document.body.style.fontFamily = "";
    };
  }, [theme]);
  return null;
}
