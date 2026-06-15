import { motion } from "framer-motion";
import type { ProfileRow, LinkRow } from "@/lib/types";
import { SocialIcon } from "./SocialIcon";
import { NameDisplay } from "./NameDisplay";
import { ArrowUpRight, Crown, Sparkles } from "lucide-react";
import { BADGE_ICON_MAP } from "@/lib/badge-icons";

const SOCIAL_TYPES = ["instagram", "discord", "whatsapp", "threads", "google", "twitter", "x", "youtube", "twitch", "github", "spotify"];

export function BioCard({ profile, links }: { profile: ProfileRow; links: LinkRow[] }) {
  const name = profile.display_name || "—";
  const socials = links.filter((l) => SOCIAL_TYPES.includes(l.type));
  const buttons = links.filter((l) => !SOCIAL_TYPES.includes(l.type));
  const accent = profile.theme.primary;

  const nameStyle = profile.name_style || "brackets";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative rounded-3xl overflow-hidden border backdrop-blur-2xl"
      style={{
        background: `linear-gradient(180deg, ${accent}25 0%, ${accent}10 60%, rgba(0,0,0,0.55) 100%)`,
        borderColor: `${accent}40`,
        boxShadow: `0 0 40px ${accent}30, inset 0 0 60px ${accent}10`,
      }}
    >
      {/* BANNER (top) */}
      <div className="relative h-28 sm:h-32 w-full overflow-hidden">
        {profile.banner_url ? (
          <img src={profile.banner_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${profile.theme.accent})`,
            }}
          />
        )}
        {/* fade to body */}
        <div
          className="absolute inset-x-0 bottom-0 h-12"
          style={{ background: `linear-gradient(to bottom, transparent, ${accent}10)` }}
        />
      </div>

      {/* BODY */}
      <div className="relative px-4 sm:px-5 pb-5 -mt-10">
        {/* avatar + name row */}
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <div
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden border-2"
              style={{
                borderColor: `${accent}80`,
                boxShadow: `0 0 20px ${accent}50`,
              }}
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={name} className="h-full w-full object-cover" />
              ) : (
                <div
                  className="h-full w-full grid place-items-center bg-black/60 font-cyber text-2xl"
                  style={{ color: accent }}
                >
                  {name.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            {profile.avatar_decoration === "crown" && (
              <Crown
                className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-6 drop-shadow-lg"
                style={{ color: accent }}
              />
            )}
          </div>

          {/* name + meta */}
          <div className="flex-1 min-w-0 pt-10">
            <NameDisplay name={name} style={nameStyle} accent={accent} animation={profile.theme.textAnimation || "none"} />
            <p className="mt-1 text-[11px] font-mono text-white/60 truncate">
              @{profile.handle}
            </p>
          </div>
        </div>

        {/* badges */}
        {profile.badges.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {profile.badges.map((b, i) => {
              const Icon = (b.icon && BADGE_ICON_MAP[b.icon]) || BADGE_ICON_MAP[b.label.toLowerCase()] || Sparkles;
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold rounded-md px-1.5 py-0.5 border"
                  style={{
                    borderColor: `${b.color}55`,
                    background: `${b.color}15`,
                    color: b.color,
                  }}
                >
                  <Icon className="h-2.5 w-2.5" />
                  {b.label}
                </span>
              );
            })}
          </div>
        )}

        {/* bio text */}
        {profile.bio && (
          <p className="mt-3 text-sm text-white/85 whitespace-pre-wrap leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* SOCIAL PILL */}
        {socials.length > 0 && (
          <div
            className="mt-4 flex items-center justify-center gap-2 px-3 py-2.5 rounded-full border"
            style={{
              background: "rgba(0,0,0,0.4)",
              borderColor: `${accent}30`,
            }}
          >
            {socials.map((l) => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={l.label}
                className="h-9 w-9 grid place-items-center rounded-full transition hover:scale-110"
                style={{
                  background: `${accent}25`,
                  color: "#fff",
                }}
              >
                <SocialIcon name={l.icon || l.type} className="h-4 w-4" />
              </a>
            ))}
          </div>
        )}

        {/* BIG BUTTONS */}
        {buttons.length > 0 && (
          <div className="mt-3 space-y-2">
            {buttons.map((l) => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all hover:translate-x-[2px]"
                style={{
                  background: `${accent}20`,
                  borderColor: `${accent}40`,
                }}
              >
                <span
                  className="h-8 w-8 rounded-lg grid place-items-center shrink-0"
                  style={{ background: `${accent}40`, color: "#fff" }}
                >
                  <SocialIcon name={l.icon} className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-white truncate">{l.label}</span>
                <ArrowUpRight
                  className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  style={{ color: accent }}
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
