import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [links, setLinks] = useState<LinkRow[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: l }] = await Promise.all([
        supabase.from("profile").select("*").limit(1).single(),
        supabase.from("links").select("*").order("position", { ascending: true }),
      ]);
      if (p) setProfile(p as unknown as ProfileRow);
      if (l) setLinks(l as LinkRow[]);
    })();
  }, []);

  if (!profile) {
    return (
      <div className="min-h-screen grid place-items-center" style={{ background: "#070014" }}>
        <p className="text-sm text-white/60 font-mono">carregando…</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: profile.theme.background || "#070014" }}>
      <ThemeApplier theme={profile.theme} />
      <BackgroundFX
        theme={profile.theme}
        imageUrl={profile.background_image_url}
        videoUrl={profile.background_video_url}
        bigText={profile.display_name}
      />
      <EntryOverlay
        effect={profile.entry_effect || "fade"}
        handle={profile.handle}
        accent={profile.theme.primary}
      />

      <main className="relative z-10 mx-auto max-w-md px-4 py-8 space-y-4">
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
