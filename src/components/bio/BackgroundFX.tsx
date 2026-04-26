import { useEffect, useRef } from "react";
import type { Theme } from "@/lib/types";

export function BackgroundFX({ theme, imageUrl, videoUrl }: {
  theme: Theme;
  imageUrl?: string | null;
  videoUrl?: string | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasParticles = theme.effects?.includes("particles");
  const hasGrid = theme.effects?.includes("grid");
  const hasScanlines = theme.effects?.includes("scanlines");

  useEffect(() => {
    if (!hasParticles) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const COUNT = 60;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 0.5,
    }));

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = theme.primary;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      // connections
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = theme.secondary;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [hasParticles, theme.primary, theme.secondary]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* solid bg */}
      <div className="absolute inset-0" style={{ background: theme.background }} />

      {/* image */}
      {imageUrl && (
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      {/* video */}
      {videoUrl && (
        <video
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
      )}

      {/* radial glows */}
      <div
        className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full blur-[120px] opacity-50"
        style={{ background: theme.primary }}
      />
      <div
        className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full blur-[120px] opacity-40"
        style={{ background: theme.accent }}
      />
      <div
        className="absolute top-1/3 right-1/4 h-[300px] w-[300px] rounded-full blur-[100px] opacity-30"
        style={{ background: theme.secondary }}
      />

      {/* grid overlay */}
      {hasGrid && <div className="absolute inset-0 grid-bg opacity-50" />}

      {/* particles */}
      {hasParticles && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
        />
      )}

      {/* scanlines */}
      {hasScanlines && (
        <div className="absolute inset-0 scanlines" />
      )}

      {/* vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
    </div>
  );
}
