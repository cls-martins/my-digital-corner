import { useEffect, useRef } from "react";

export function CursorFX({ variant = "glow" }: { variant?: string }) {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant === "default" || variant === "none") return;
    let rafId = 0;
    let mx = 0, my = 0;
    let rx = 0, ry = 0;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx - 4}px, ${my - 4}px, 0)`;
      }
    };
    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx - 18}px, ${ry - 18}px, 0)`;
      }
      if (trailRef.current) {
        trailRef.current.style.transform = `translate3d(${rx - 40}px, ${ry - 40}px, 0)`;
      }
      rafId = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove);
    rafId = requestAnimationFrame(tick);
    document.documentElement.style.cursor = "none";
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
      document.documentElement.style.cursor = "";
    };
  }, [variant]);

  if (variant === "default" || variant === "none") return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      <div
        ref={trailRef}
        className="absolute h-20 w-20 rounded-full opacity-30 blur-2xl"
        style={{ background: "var(--neon-primary)" }}
      />
      <div
        ref={ringRef}
        className="absolute h-9 w-9 rounded-full border mix-blend-screen transition-[width,height] duration-200"
        style={{
          borderColor: "var(--neon-primary)",
          boxShadow: "0 0 20px var(--neon-primary)",
        }}
      />
      <div
        ref={dotRef}
        className="absolute h-2 w-2 rounded-full"
        style={{ background: "var(--neon-accent)", boxShadow: "0 0 12px var(--neon-accent)" }}
      />
    </div>
  );
}
