import { motion } from "framer-motion";
import type { ProfileRow, LinkRow } from "@/lib/types";
import { SocialIcon } from "./SocialIcon";
import { Verified, Sparkles, Crown, Zap } from "lucide-react";

const BADGE_ICONS: Record<string, typeof Verified> = {
  premium: Crown,
  founder: Sparkles,
  verified: Verified,
  staff: Zap,
};

export function BioCard({ profile, links }: { profile: ProfileRow; links: LinkRow[] }) {
  const textAnim = profile.theme.textAnimation || "glitch";
  const name = profile.display_name || "—";

  const NameDisplay = (
    textAnim === "glitch" ? (
      <h1
        data-text={name}
        className="glitch font-cyber text-4xl sm:text-5xl font-bold tracking-tight"
        style={{ color: "var(--neon-primary)" }}
      >
        {name}
      </h1>
    ) : textAnim === "shimmer" ? (
      <h1 className="gradient-text font-cyber text-4xl sm:text-5xl font-bold tracking-tight">{name}</h1>
    ) : (
      <h1 className="font-cyber text-4xl sm:text-5xl font-bold tracking-tight neon-text">{name}</h1>
    )
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative glass rounded-3xl p-6 sm:p-8 overflow-hidden"
    >
      {/* avatar + halo */}
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-2 rounded-full opacity-70 blur-md"
            style={{
              background: `conic-gradient(from 0deg, var(--neon-primary), var(--neon-secondary), var(--neon-accent), var(--neon-primary))`,
            }}
          />
          <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden ring-2 ring-white/10">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full grid place-items-center bg-black/40 font-cyber text-3xl"
                style={{ color: "var(--neon-primary)" }}>
                {name.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          {profile.avatar_decoration === "crown" && (
            <Crown className="absolute -top-3 left-1/2 -translate-x-1/2 h-7 w-7 drop-shadow-lg"
              style={{ color: "var(--neon-accent)" }} />
          )}
        </div>

        <div className="mt-5">{NameDisplay}</div>
        <p className="mt-1 text-xs sm:text-sm font-mono text-muted-foreground">@{profile.handle}</p>

        {/* badges */}
        {profile.badges.length > 0 && (
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {profile.badges.map((b, i) => {
              const Icon = BADGE_ICONS[b.label.toLowerCase()] || Sparkles;
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold rounded-full px-2.5 py-1 border"
                  style={{
                    borderColor: `${b.color}66`,
                    background: `${b.color}15`,
                    color: b.color,
                    boxShadow: `0 0 12px ${b.color}40`,
                  }}
                >
                  <Icon className="h-3 w-3" />
                  {b.label}
                </span>
              );
            })}
          </div>
        )}

        <p className="mt-4 max-w-md text-sm sm:text-base text-foreground/85 whitespace-pre-wrap">
          {profile.bio}
        </p>

        {/* social row */}
        {links.filter((l) => ["instagram", "discord", "whatsapp", "threads", "google", "twitter", "x", "youtube", "twitch", "github"].includes(l.type)).length > 0 && (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {links
              .filter((l) => ["instagram", "discord", "whatsapp", "threads", "google", "twitter", "x", "youtube", "twitch", "github"].includes(l.type))
              .map((l) => (
                <a
                  key={l.id}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={l.label}
                  className="h-10 w-10 rounded-xl grid place-items-center glass hover:scale-110 transition-transform"
                  style={{
                    boxShadow: "0 0 16px color-mix(in oklab, var(--neon-primary) 30%, transparent)",
                  }}
                >
                  <SocialIcon name={l.icon || l.type} className="h-4 w-4" />
                </a>
              ))}
          </div>
        )}

        {/* big buttons (custom + widget) */}
        <div className="mt-5 w-full space-y-2">
          {links
            .filter((l) => ["custom", "widget"].includes(l.type))
            .map((l) => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 w-full px-4 py-3 rounded-xl glass hover:translate-y-[-2px] transition-all"
              >
                <SocialIcon name={l.icon} className="h-4 w-4" />
                <span className="text-sm font-medium">{l.label}</span>
                <span className="ml-auto text-xs text-muted-foreground group-hover:text-foreground transition">↗</span>
              </a>
            ))}
        </div>
      </div>
    </motion.div>
  );
}
