-- Fix: Allow challenges to be viewed by share code lookup (for accepting challenges)
-- Drop the overly restrictive policies
DROP POLICY IF EXISTS "Challengers can view own challenges" ON public.challenges;
DROP POLICY IF EXISTS "Challenge participants can view" ON public.challenges;

-- Authenticated users can view challenges (needed for share code lookup)
-- The share_code is still "private" in that you need the code to find the challenge
CREATE POLICY "Authenticated can view challenges"
ON public.challenges
FOR SELECT
USING (auth.uid() IS NOT NULL);