import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileRow, LinkRow } from "@/lib/types";
import { BackgroundFX } from "@/components/bio/BackgroundFX";
import { CursorFX } from "@/components/bio/CursorFX";
import { ThemeApplier } from "@/components/bio/ThemeApplier";
import { BioCard } from "@/components/bio/BioCard";
import { AudioPlayer } from "@/components/bio/AudioPlayer";
import { CommentsBox } from "@/components/bio/CommentsBox";
import { Settings } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "martins ✦ bio" },
      { name: "description", content: "minha bio digital — links, vibes e contato." },
      { property: "og:title", content: "martins ✦ bio" },
      { property: "og:description", content: "minha bio digital — links, vibes e contato." },
    ],
  }),
  component: Index,
});

function Index() {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [links, setLinks] = useState<LinkRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const [{ data: p }, { data: l }] = await Promise.all([
        supabase.from("profile").select("*").limit(1).single(),
        supabase.from("links").select("*").order("position", { ascending: true }),
      ]);
      if (p) setProfile(p as unknown as ProfileRow);
      if (l) setLinks(l as LinkRow[]);
    };
    load();

    const ch = supabase
      .channel("bio-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "profile" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "links" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  if (!profile) {
    return (
      <div className="min-h-screen grid place-items-center" style={{ background: "#070014" }}>
        <div className="font-mono text-xs text-muted-foreground animate-pulse">carregando…</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <ThemeApplier theme={profile.theme} />
      <BackgroundFX
        theme={profile.theme}
        imageUrl={profile.background_image_url}
        videoUrl={profile.background_video_url}
      />
      <CursorFX variant={profile.theme.cursor} />

      {/* admin link */}
      <Link
        to="/admin"
        className="fixed top-4 right-4 z-50 h-9 w-9 grid place-items-center rounded-full glass hover:scale-110 transition"
        aria-label="Admin"
      >
        <Settings className="h-4 w-4" />
      </Link>

      <main className="relative z-10 mx-auto max-w-md px-4 py-8 sm:py-12 space-y-4">
        <BioCard profile={profile} links={links} />

        {profile.audio_url && (
          <AudioPlayer
            src={profile.audio_url}
            title={profile.audio_title}
            artist={profile.audio_artist}
          />
        )}

        <CommentsBox />

        <footer className="pt-4 text-center text-[10px] uppercase tracking-[0.3em] font-mono text-muted-foreground/60">
          ✦ powered by you ✦
        </footer>
      </main>
    </div>
  );
}
