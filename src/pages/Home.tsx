import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileRow, LinkRow } from "@/lib/types";
import { BioCard } from "@/components/bio/BioCard";
import { BackgroundFX } from "@/components/bio/BackgroundFX";
import { ThemeApplier } from "@/components/bio/ThemeApplier";
import { EntryOverlay } from "@/components/bio/EntryOverlay";
import { AudioPlayer } from "@/components/bio/AudioPlayer";
import { CommentsBox } from "@/components/bio/CommentsBox";

export default function Home() {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: p, error: pe }, { data: l, error: le }] = await Promise.all([
          supabase.from("profile").select("*").limit(1).maybeSingle(),
          supabase.from("links").select("*").order("position", { ascending: true }),
        ]);
        if (pe) throw pe;
        if (le) throw le;
        setProfile(p as ProfileRow | null);
        setLinks((l || []) as LinkRow[]);
      } catch (e) {
        setErr((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-black text-white/60 font-mono text-sm">
        carregando…
      </div>
    );
  }

  if (err || !profile) {
    return (
      <div className="min-h-screen grid place-items-center bg-black text-white p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">Perfil indisponível</h1>
          <p className="mt-2 text-sm text-white/60">{err || "Nenhum perfil encontrado."}</p>
          <a href="/admin" className="mt-4 inline-block text-xs underline text-white/50">admin</a>
        </div>
      </div>
    );
  }

  return (
    <>
      <ThemeApplier theme={profile.theme} />
      <BackgroundFX
        theme={profile.theme}
        imageUrl={profile.background_image_url}
        videoUrl={profile.background_video_url}
        bigText={profile.handle}
      />
      <EntryOverlay
        effect={profile.entry_effect || "none"}
        handle={profile.handle}
        accent={profile.theme.primary}
      />

      <main className="relative min-h-screen flex flex-col items-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md space-y-4">
          <BioCard profile={profile} links={links} />

          {profile.audio_url && (
            <AudioPlayer
              src={profile.audio_url}
              title={profile.audio_title}
              artist={profile.audio_artist}
            />
          )}

          <CommentsBox />

          <div className="text-center pt-2">
            <a
              href="/admin"
              className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30 hover:text-white/60 transition"
            >
              admin
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
