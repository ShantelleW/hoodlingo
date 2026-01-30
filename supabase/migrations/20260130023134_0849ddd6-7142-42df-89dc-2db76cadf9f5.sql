-- Fix 1: Restrict profiles SELECT to own profile only (protect phone numbers)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Users can only view their own full profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow viewing limited profile data for leaderboards/challenges (initials, avatar only)
CREATE POLICY "Public can view limited profile data"
ON public.profiles
FOR SELECT
USING (
  -- This policy allows SELECT but sensitive columns should be handled at query level
  -- For leaderboard display, only initials and avatar_id are needed
  true
);

-- Actually, let's use a simpler approach - just restrict to own profile since 
-- scores table already has initials/avatar for leaderboard
DROP POLICY IF EXISTS "Public can view limited profile data" ON public.profiles;

-- Fix 2: Restrict challenges visibility to challenger and responders only
DROP POLICY IF EXISTS "Anyone can view challenges" ON public.challenges;

-- Challengers can view their own challenges
CREATE POLICY "Challengers can view own challenges"
ON public.challenges
FOR SELECT
USING (auth.uid() = challenger_id);

-- People with the share code can view the challenge (via lookup)
-- This is handled by the share_code lookup which is authenticated
CREATE POLICY "Authenticated users can view challenges by share code"
ON public.challenges
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Actually this is still too permissive. Let's be more restrictive:
DROP POLICY IF EXISTS "Authenticated users can view challenges by share code" ON public.challenges;

-- Only challenger or responders can view challenges
CREATE POLICY "Challenge participants can view"
ON public.challenges
FOR SELECT
USING (
  auth.uid() = challenger_id 
  OR EXISTS (
    SELECT 1 FROM public.challenge_responses 
    WHERE challenge_id = challenges.id 
    AND responder_id = auth.uid()
  )
);