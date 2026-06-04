
CREATE OR REPLACE FUNCTION public.get_leaderboard(
  _timeframe text DEFAULT 'all_time',
  _category text DEFAULT NULL
)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  initials text,
  avatar_id text,
  quiz_points bigint,
  submission_points bigint,
  vote_points bigint,
  challenge_points bigint,
  total_points bigint,
  games_played bigint,
  approved_submissions bigint,
  rank bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH window_bounds AS (
    SELECT CASE
      WHEN _timeframe = 'weekly' THEN now() - interval '7 days'
      WHEN _timeframe = 'monthly' THEN now() - interval '30 days'
      ELSE 'epoch'::timestamptz
    END AS since
  ),
  quiz AS (
    SELECT s.user_id, COALESCE(SUM(s.score), 0)::bigint AS pts, COUNT(*)::bigint AS games
    FROM scores s, window_bounds w
    WHERE s.created_at >= w.since
      AND (_category IS NULL OR s.category = _category)
    GROUP BY s.user_id
  ),
  subs AS (
    SELECT q.submitted_by AS user_id,
           (COUNT(*) * 10)::bigint AS pts,
           COUNT(*)::bigint AS approved_count
    FROM questions q, window_bounds w
    WHERE q.is_approved = true
      AND q.submitted_by IS NOT NULL
      AND q.created_at >= w.since
      AND (_category IS NULL OR q.category = _category)
    GROUP BY q.submitted_by
  ),
  votes AS (
    SELECT v.og_user_id AS user_id, COUNT(*)::bigint AS pts
    FROM og_votes v, window_bounds w
    WHERE v.created_at >= w.since
    GROUP BY v.og_user_id
  ),
  challenge_wins AS (
    SELECT cr.responder_id AS user_id, (COUNT(*) * 5)::bigint AS pts
    FROM challenge_responses cr
    JOIN challenges c ON c.id = cr.challenge_id, window_bounds w
    WHERE cr.created_at >= w.since
      AND cr.score > c.challenger_score
      AND (_category IS NULL OR c.category = _category)
    GROUP BY cr.responder_id
    UNION ALL
    SELECT c.challenger_id AS user_id, (COUNT(*) * 5)::bigint AS pts
    FROM challenges c
    JOIN challenge_responses cr ON cr.challenge_id = c.id, window_bounds w
    WHERE c.created_at >= w.since
      AND c.challenger_score > cr.score
      AND (_category IS NULL OR c.category = _category)
    GROUP BY c.challenger_id
  ),
  challenge_agg AS (
    SELECT user_id, SUM(pts)::bigint AS pts FROM challenge_wins GROUP BY user_id
  ),
  ids AS (
    SELECT user_id FROM quiz
    UNION SELECT user_id FROM subs
    UNION SELECT user_id FROM votes
    UNION SELECT user_id FROM challenge_agg
  ),
  combined AS (
    SELECT
      i.user_id,
      COALESCE(q.pts, 0) AS quiz_points,
      COALESCE(s.pts, 0) AS submission_points,
      COALESCE(v.pts, 0) AS vote_points,
      COALESCE(c.pts, 0) AS challenge_points,
      (COALESCE(q.pts,0) + COALESCE(s.pts,0) + COALESCE(v.pts,0) + COALESCE(c.pts,0)) AS total_points,
      COALESCE(q.games, 0) AS games_played,
      COALESCE(s.approved_count, 0) AS approved_submissions
    FROM ids i
    LEFT JOIN quiz q USING (user_id)
    LEFT JOIN subs s USING (user_id)
    LEFT JOIN votes v USING (user_id)
    LEFT JOIN challenge_agg c USING (user_id)
  )
  SELECT
    cb.user_id,
    p.display_name,
    p.initials,
    p.avatar_id,
    cb.quiz_points,
    cb.submission_points,
    cb.vote_points,
    cb.challenge_points,
    cb.total_points,
    cb.games_played,
    cb.approved_submissions,
    RANK() OVER (ORDER BY cb.total_points DESC) AS rank
  FROM combined cb
  LEFT JOIN profiles p ON p.user_id = cb.user_id
  WHERE cb.total_points > 0
  ORDER BY cb.total_points DESC
  LIMIT 100;
$$;

GRANT EXECUTE ON FUNCTION public.get_leaderboard(text, text) TO anon, authenticated;
