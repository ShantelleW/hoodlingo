-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  initials TEXT CHECK (char_length(initials) = 3),
  avatar_id TEXT DEFAULT 'avatar1',
  phone TEXT,
  games_played INTEGER DEFAULT 0,
  has_paid BOOLEAN DEFAULT false,
  is_og BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scores/leaderboard table
CREATE TABLE public.scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  initials TEXT NOT NULL CHECK (char_length(initials) = 3),
  avatar_id TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  hint TEXT,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  result_title TEXT,
  result_commentary TEXT,
  result_image_url TEXT,
  submitted_by UUID REFERENCES auth.users(id),
  is_approved BOOLEAN DEFAULT false,
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenges table
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_ids UUID[] NOT NULL,
  category TEXT NOT NULL,
  challenger_score INTEGER NOT NULL,
  share_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenge responses table
CREATE TABLE public.challenge_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create question submissions table for OG voting
CREATE TABLE public.question_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submitted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  hint TEXT,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  result_title TEXT,
  result_commentary TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'voting', 'approved', 'rejected')),
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create OG votes table
CREATE TABLE public.og_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  og_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES public.question_submissions(id) ON DELETE CASCADE,
  vote BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(og_user_id, submission_id)
);

-- Create category masters table
CREATE TABLE public.category_masters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  approved_questions_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, category)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.og_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_masters ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Scores policies (public leaderboard)
CREATE POLICY "Anyone can view scores" ON public.scores FOR SELECT USING (true);
CREATE POLICY "Users can insert their own scores" ON public.scores FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Questions policies (approved questions are public)
CREATE POLICY "Anyone can view approved questions" ON public.questions FOR SELECT USING (is_approved = true);

-- Challenges policies
CREATE POLICY "Anyone can view challenges" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Users can create challenges" ON public.challenges FOR INSERT WITH CHECK (auth.uid() = challenger_id);

-- Challenge responses policies
CREATE POLICY "Users can view challenge responses" ON public.challenge_responses FOR SELECT USING (true);
CREATE POLICY "Users can respond to challenges" ON public.challenge_responses FOR INSERT WITH CHECK (auth.uid() = responder_id);

-- Question submissions policies
CREATE POLICY "Users can view their own submissions" ON public.question_submissions FOR SELECT USING (auth.uid() = submitted_by);
CREATE POLICY "Users can submit questions" ON public.question_submissions FOR INSERT WITH CHECK (auth.uid() = submitted_by);

-- OG votes policies
CREATE POLICY "OGs can view their votes" ON public.og_votes FOR SELECT USING (auth.uid() = og_user_id);
CREATE POLICY "OGs can vote" ON public.og_votes FOR INSERT WITH CHECK (auth.uid() = og_user_id);

-- Category masters policies
CREATE POLICY "Anyone can view category masters" ON public.category_masters FOR SELECT USING (true);

-- Create function to handle profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profile timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();