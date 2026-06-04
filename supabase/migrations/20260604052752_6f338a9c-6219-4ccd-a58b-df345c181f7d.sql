-- 1. challenge_responses: restrict SELECT to participants
DROP POLICY IF EXISTS "Users can view challenge responses" ON public.challenge_responses;
CREATE POLICY "Participants can view challenge responses"
  ON public.challenge_responses
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = responder_id
    OR EXISTS (
      SELECT 1 FROM public.challenges c
      WHERE c.id = challenge_id AND c.challenger_id = auth.uid()
    )
  );

-- 2. scores: restrict SELECT to authenticated, deny UPDATE/DELETE explicitly
DROP POLICY IF EXISTS "Anyone can view scores" ON public.scores;
CREATE POLICY "Authenticated users can view scores"
  ON public.scores
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "No score updates"
  ON public.scores
  FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "No score deletes"
  ON public.scores
  FOR DELETE
  TO authenticated
  USING (false);

-- 3. question_submissions: replace OG full-row access with a view that hides correct_answer
DROP POLICY IF EXISTS "OGs can view pending submissions" ON public.question_submissions;

CREATE POLICY "Admins can view all submissions"
  ON public.question_submissions
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE VIEW public.question_submissions_og
WITH (security_invoker = on) AS
SELECT
  id, category, question, options, hint,
  result_title, result_commentary,
  correct_image_url, wrong_image_url,
  status, votes_for, votes_against,
  submitted_by, created_at
FROM public.question_submissions
WHERE status = 'pending'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND is_og = true
  );

GRANT SELECT ON public.question_submissions_og TO authenticated;

-- 4. update_updated_at_column: SECURITY INVOKER (no elevation needed)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
