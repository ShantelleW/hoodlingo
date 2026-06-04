import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type Timeframe = 'all_time' | 'weekly' | 'monthly';

export interface LeaderboardRow {
  user_id: string;
  display_name: string | null;
  initials: string | null;
  avatar_id: string | null;
  quiz_points: number;
  submission_points: number;
  vote_points: number;
  challenge_points: number;
  total_points: number;
  games_played: number;
  approved_submissions: number;
  rank: number;
}

export function useLeaderboard(timeframe: Timeframe, category: string | null) {
  return useQuery({
    queryKey: ['leaderboard', timeframe, category],
    queryFn: async (): Promise<LeaderboardRow[]> => {
      const { data, error } = await supabase.rpc('get_leaderboard', {
        _timeframe: timeframe,
        _category: category,
      });
      if (error) throw error;
      return (data as LeaderboardRow[]) || [];
    },
    staleTime: 30_000,
  });
}
