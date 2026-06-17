import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { EntryEffect } from "@/lib/types";

export function EntryOverlay({
  effect,
  handle,
  accent,
  onEnter,
}: {
  effect: EntryEffect;
  handle: string;
  accent: string;
  onEnter?: () => void;
}) {
  const [visible, setVisible] = useState(effect !== "none");
  const [typed, setTyped] = useState("");

  // Auto-hide non-click effects
  useEffect(() => {
    if (effect === "none" || effect === "click") return null;
    const ms = effect === "typewriter" ? 1800 : effect === "scan" ? 1400 : 900;
    const t = setTimeout(() => {
      setVisible(false);
      onEnter?.();
    }, ms);
    return () => clearTimeout(t);
  }, [effect, onEnter]);

  // Typewriter
  useEffect(() => {
    if (effect !== "typewriter" || !visible) return null;
    let i = 0;
    const txt = `@${handle || "bio"}`;
    const id = setInterval(() => {
      i++;
      setTyped(txt.slice(0, i));
      if (i >= txt.length) clearInterval(id);
    }, 70);
    return () => clearInterval(id);
  }, [effect, visible, handle]);

  const dismiss = () => {
    setVisible(false);
    onEnter?.();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          className="fixed inset-0 z-[100] grid place-items-center cursor-pointer"
          style={{ background: "rgba(3,0,12,0.96)" }}
          onClick={effect === "click" ? dismiss : undefined}
        >
          {/* radial glow */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at center, ${accent}22, transparent 60%)`,
            }}
          />

          {effect === "click" && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative text-center select-none"
            >
              <div
                className="font-cyber text-5xl sm:text-7xl font-black uppercase tracking-tight"
                style={{ color: "#fff", textShadow: `0 0 40px ${accent}` }}
              >
                click
              </div>
              <div
                className="mt-2 font-mono text-xs uppercase tracking-[0.3em]"
                style={{ color: accent }}
              >
                to enter
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="mx-auto mt-6 h-2 w-2 rounded-full"
                style={{ background: accent, boxShadow: `0 0 20px ${accent}` }}
              />
            </motion.div>
          )}

          {effect === "typewriter" && (
            <div className="relative font-mono text-2xl sm:text-4xl" style={{ color: accent }}>
              {typed}
              <span className="inline-block w-[2px] h-[1em] align-middle ml-1 animate-pulse" style={{ background: accent }} />
            </div>
          )}

          {effect === "glitch" && (
            <div className="relative font-cyber text-5xl sm:text-7xl font-black uppercase">
              <span style={{ color: "#fff" }}>@{handle || "bio"}</span>
              <span
                className="absolute inset-0 animate-pulse"
                style={{ color: accent, transform: "translate(2px,-2px)", mixBlendMode: "screen" }}
              >
                @{handle || "bio"}
              </span>
            </div>
          )}

          {effect === "scan" && (
            <>
              <div className="font-cyber text-4xl sm:text-6xl font-black uppercase" style={{ color: "#fff" }}>
                @{handle || "bio"}
              </div>
              <motion.div
                initial={{ y: "-100%" }}
                animate={{ y: "100%" }}
                transition={{ duration: 1.2, ease: "linear" }}
                className="absolute inset-x-0 h-24 pointer-events-none"
                style={{
                  background: `linear-gradient(to bottom, transparent, ${accent}88, transparent)`,
                }}
              />
            </>
          )}

          {effect === "fade" && (
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="font-mono text-xs uppercase tracking-[0.4em]"
              style={{ color: accent }}
            >
              loading
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
