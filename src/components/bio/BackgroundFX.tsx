import { useEffect, useRef } from "react";
import type { Theme } from "@/lib/types";

export function BackgroundFX({ theme, imageUrl, videoUrl, bigText }: {
  theme: Theme;
  imageUrl?: string | null;
  videoUrl?: string | null;
  bigText?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasParticles = theme.effects?.includes("particles");
  const hasGrid = theme.effects?.includes("grid");
  const hasScanlines = theme.effects?.includes("scanlines");
  const showBigText = theme.effects?.includes("bigtext") !== false; // default ON

  useEffect(() => {
    if (!hasParticles) return null;
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    let raf = 0;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const COUNT = 50;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.6 + 0.4,
    }));

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = theme.primary;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [hasParticles, theme.primary]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* solid bg */}
      <div className="absolute inset-0" style={{ background: theme.background || "#050505" }} />

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

      {/* diagonal sheen lines (slat.cc style) */}
      <div className="absolute inset-0 sheen-lines opacity-[0.07]" />

      {/* GIANT handle text — slat.cc signature look */}
      {showBigText && bigText && (
        <div className="absolute inset-0 grid place-items-center select-none">
          <h2
            className="font-cyber font-black uppercase whitespace-nowrap leading-none"
            style={{
              fontSize: "clamp(8rem, 28vw, 24rem)",
              color: theme.primary,
              opacity: 0.18,
              textShadow: `0 0 80px ${theme.primary}`,
              letterSpacing: "-0.04em",
              transform: "translateY(0)",
            }}
          >
            {bigText}
          </h2>
        </div>
      )}

      {/* radial glows */}
      <div
        className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full blur-[140px] opacity-30"
        style={{ background: theme.primary }}
      />
      <div
        className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full blur-[140px] opacity-25"
        style={{ background: theme.accent }}
      />

      {/* grid overlay */}
      {hasGrid && <div className="absolute inset-0 grid-bg opacity-30" />}

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
      <div className="absolute inset-0 bg-gradient-radial-vignette" />
    </div>
  );
}
