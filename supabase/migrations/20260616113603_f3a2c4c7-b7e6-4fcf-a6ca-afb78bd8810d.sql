ALTER TABLE public.comments
ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS comments_single_pinned_idx
ON public.comments (is_pinned)
WHERE is_pinned = true;