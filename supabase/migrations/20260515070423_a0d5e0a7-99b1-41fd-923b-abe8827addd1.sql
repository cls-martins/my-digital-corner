ALTER TABLE public.profile
  ADD COLUMN IF NOT EXISTS name_style text NOT NULL DEFAULT 'brackets',
  ADD COLUMN IF NOT EXISTS entry_effect text NOT NULL DEFAULT 'fade';