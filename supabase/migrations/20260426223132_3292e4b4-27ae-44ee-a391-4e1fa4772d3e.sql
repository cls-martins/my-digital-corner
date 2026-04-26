
-- PROFILE (singleton)
CREATE TABLE public.profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL DEFAULT 'seu nome',
  handle TEXT NOT NULL DEFAULT 'martins',
  bio TEXT NOT NULL DEFAULT 'bem-vindo à minha bio ✦',
  avatar_url TEXT,
  avatar_decoration TEXT DEFAULT 'none',
  background_video_url TEXT,
  background_image_url TEXT,
  audio_url TEXT,
  audio_title TEXT,
  audio_artist TEXT,
  badges JSONB NOT NULL DEFAULT '[]'::jsonb,
  theme JSONB NOT NULL DEFAULT '{
    "primary":"#a855f7",
    "secondary":"#06b6d4",
    "accent":"#ec4899",
    "background":"#070014",
    "font":"Space Grotesk",
    "cursor":"glow",
    "effects":["particles","grid"],
    "textAnimation":"glitch"
  }'::jsonb,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- LINKS
CREATE TABLE public.links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'link',
  type TEXT NOT NULL DEFAULT 'custom', -- google, whatsapp, discord, instagram, threads, custom, widget
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- COMMENTS
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER profile_touch BEFORE UPDATE ON public.profile
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed singleton row
INSERT INTO public.profile (display_name, handle, bio, badges)
VALUES ('martins', 'martins', 'criando coisas na internet ✦ welcome to my space',
  '[{"label":"founder","color":"#a855f7"},{"label":"premium","color":"#facc15"}]'::jsonb);

-- Seed default links
INSERT INTO public.links (label, url, icon, type, position) VALUES
('Instagram', 'https://instagram.com', 'instagram', 'instagram', 0),
('Discord', 'https://discord.com', 'discord', 'discord', 1),
('WhatsApp', 'https://wa.me/', 'whatsapp', 'whatsapp', 2),
('Threads', 'https://threads.net', 'threads', 'threads', 3),
('Google', 'https://google.com', 'google', 'google', 4);

-- RLS
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Public read for everything
CREATE POLICY "public read profile" ON public.profile FOR SELECT USING (true);
CREATE POLICY "public read links" ON public.links FOR SELECT USING (true);
CREATE POLICY "public read comments" ON public.comments FOR SELECT USING (true);

-- Anyone can post comments
CREATE POLICY "public insert comments" ON public.comments FOR INSERT WITH CHECK (
  length(nickname) BETWEEN 1 AND 40 AND length(message) BETWEEN 1 AND 500
);

-- Admin actions (update profile, manage links, delete comments) go through edge function with service role.
-- No public update/delete/insert policies on profile/links so client cannot tamper.

-- Storage bucket for media uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "media public read" ON storage.objects FOR SELECT USING (bucket_id = 'media');
-- Uploads also go via edge function (service role), so no public insert policy needed.
