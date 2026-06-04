import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PlayerStats {
  user_id: string;
  display_name: string | null;
  initials: string | null;
  avatar_id: string | null;
  is_og: boolean;
  quiz_points: number;
  submission_points: number;
  vote_points: number;
  challenge_points: number;
  total_points: number;
  games_played: number;
  approved_submissions_count: number;
  accuracy: number;
  approved_submissions: Array<{ id: string; category: string; question: string; created_at: string }>;
  recent_activity: Array<Record<string, unknown> & { type: string; created_at: string }>;
}

export function usePlayerStats(userId: string | undefined) {
  return useQuery({
    queryKey: ['player-stats', userId],
    enabled: !!userId,
    queryFn: async (): Promise<PlayerStats | null> => {
      if (!userId) return null;
      const { data, error } = await supabase.rpc('get_player_stats', { _user_id: userId });
      if (error) throw error;
      return data as unknown as PlayerStats;
    },
  });
}
