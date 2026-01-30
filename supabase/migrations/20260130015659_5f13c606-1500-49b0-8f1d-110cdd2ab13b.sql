-- Create categories table
CREATE TABLE public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '📚',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  question_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view active categories
CREATE POLICY "Anyone can view active categories"
ON public.categories FOR SELECT
USING (is_active = true);

-- Admins can manage categories
CREATE POLICY "Admins can manage categories"
ON public.categories FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Seed with existing categories
INSERT INTO public.categories (id, name, emoji, description) VALUES
  ('rap', 'Rap', '🎤', 'Hip-hop history, artists, albums, and lyrics'),
  ('streets', 'These Streets', '🗽', 'NYC geography, landmarks, and street culture'),
  ('flicks', 'Hood Flicks', '🎬', 'Classic movies and iconic film moments'),
  ('stores', 'Corner Stores', '🏪', 'Bodega culture, snacks, and neighborhood staples');