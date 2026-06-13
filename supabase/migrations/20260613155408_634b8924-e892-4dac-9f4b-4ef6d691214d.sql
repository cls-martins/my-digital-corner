-- Threaded comments
ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_author boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON public.comments(parent_id);

-- Admin-managed posts feed
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'text',
  content text,
  media_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.posts TO anon, authenticated;
GRANT ALL ON public.posts TO service_role;

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read posts" ON public.posts;
CREATE POLICY "public read posts" ON public.posts FOR SELECT USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER TABLE public.posts REPLICA IDENTITY FULL;