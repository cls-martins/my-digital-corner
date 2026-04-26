import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileRow, LinkRow } from "@/lib/types";
import { BackgroundFX } from "@/components/bio/BackgroundFX";
import { ThemeApplier } from "@/components/bio/ThemeApplier";
import { BioCard } from "@/components/bio/BioCard";
import { AudioPlayer } from "@/components/bio/AudioPlayer";
import { CommentsBox } from "@/components/bio/CommentsBox";

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
        bigText={profile.handle}
      />

      <main className="relative z-10 mx-auto max-w-md px-4 py-10 sm:py-16 space-y-4">
        <BioCard profile={profile} links={links} />

        {profile.audio_url && (
          <AudioPlayer
            src={profile.audio_url}
            title={profile.audio_title}
            artist={profile.audio_artist}
          />
        )}

        <CommentsBox />
      </main>
    </div>
  );
}
