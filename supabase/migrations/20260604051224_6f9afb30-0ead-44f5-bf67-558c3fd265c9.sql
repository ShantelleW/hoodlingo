
-- Add image columns to question_submissions
ALTER TABLE public.question_submissions
  ADD COLUMN IF NOT EXISTS correct_image_url text,
  ADD COLUMN IF NOT EXISTS wrong_image_url text;

ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS correct_image_url text,
  ADD COLUMN IF NOT EXISTS wrong_image_url text;

-- Storage RLS for submission-images bucket
-- Anyone (incl. anon) can read submission images so emails can embed them
CREATE POLICY "Public read submission images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'submission-images');

CREATE POLICY "Authenticated upload submission images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'submission-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users update own submission images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'submission-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own submission images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'submission-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Add email column to profiles for digest sending
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS notify_digest boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_digest_sent_at timestamptz;

-- Backfill emails from auth.users for existing profiles
UPDATE public.profiles p
  SET email = u.email
  FROM auth.users u
  WHERE p.user_id = u.id AND p.email IS NULL;

-- Update trigger to capture email on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$function$;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
