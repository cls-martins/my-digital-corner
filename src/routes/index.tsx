import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileRow, LinkRow } from "@/lib/types";
import { BackgroundFX } from "@/components/bio/BackgroundFX";
import { ThemeApplier } from "@/components/bio/ThemeApplier";
import { BioCard } from "@/components/bio/BioCard";
import { AudioPlayer } from "@/components/bio/AudioPlayer";
import { CommentsBox } from "@/components/bio/CommentsBox";
import { EntryOverlay } from "@/components/bio/EntryOverlay";

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
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errMsg, setErrMsg] = useState<string>("");

  const load = async () => {
    setStatus("loading");
    setErrMsg("");
    try {
      const [pRes, lRes] = await Promise.all([
        supabase.from("profile").select("*").limit(1).maybeSingle(),
        supabase.from("links").select("*").order("position", { ascending: true }),
      ]);
      if (pRes.error) throw pRes.error;
      if (pRes.data) setProfile(pRes.data as unknown as ProfileRow);
      if (lRes.data) setLinks(lRes.data as LinkRow[]);
      setStatus("ready");
    } catch (e) {
      setErrMsg((e as Error).message || "falha ao conectar");
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("bio-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "profile" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "links" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "loading" && !profile) {
    return (
      <div className="min-h-screen grid place-items-center" style={{ background: "#070014" }}>
        <div className="font-mono text-xs text-muted-foreground animate-pulse">carregando…</div>
      </div>
    );
  }

  if (status === "error" && !profile) {
    return (
      <div className="min-h-screen grid place-items-center px-4" style={{ background: "#070014" }}>
        <div className="max-w-sm text-center space-y-3">
          <div className="font-cyber text-xl text-white">conexão indisponível</div>
          <p className="font-mono text-xs text-muted-foreground break-words">
            {errMsg || "não foi possível alcançar o servidor."}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground/70">
            o backend pode estar pausado. reative o Lovable Cloud nas configurações.
          </p>
          <button
            onClick={load}
            className="mt-2 px-4 py-2 text-xs rounded-lg border border-white/15 hover:border-white/40 text-white"
          >
            tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const entryEffect = profile.entry_effect || "fade";

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <ThemeApplier theme={profile.theme} />
      <BackgroundFX
        theme={profile.theme}
        imageUrl={profile.background_image_url}
        videoUrl={profile.background_video_url}
        bigText={profile.handle}
      />

      <EntryOverlay
        effect={entryEffect}
        handle={profile.handle}
        accent={profile.theme.primary}
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
