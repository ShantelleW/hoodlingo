
CREATE OR REPLACE FUNCTION public.get_player_stats(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prof record;
  quiz_pts bigint := 0;
  sub_pts bigint := 0;
  vote_pts bigint := 0;
  chal_pts bigint := 0;
  games bigint := 0;
  approved bigint := 0;
  total_q bigint;
  submissions_list jsonb;
  activity_list jsonb;
BEGIN
  SELECT user_id, display_name, initials, avatar_id, is_og, games_played
    INTO prof FROM profiles WHERE user_id = _user_id;

  SELECT COALESCE(SUM(score),0), COUNT(*) INTO quiz_pts, games
    FROM scores WHERE user_id = _user_id;

  SELECT COUNT(*)*10, COUNT(*) INTO sub_pts, approved
    FROM questions WHERE submitted_by = _user_id AND is_approved = true;

  SELECT COUNT(*) INTO vote_pts FROM og_votes WHERE og_user_id = _user_id;

  SELECT COALESCE(SUM(pts),0) INTO chal_pts FROM (
    SELECT (COUNT(*) * 5)::bigint AS pts
      FROM challenge_responses cr
      JOIN challenges c ON c.id = cr.challenge_id
      WHERE cr.responder_id = _user_id AND cr.score > c.challenger_score
    UNION ALL
    SELECT (COUNT(*) * 5)::bigint AS pts
      FROM challenges c
      JOIN challenge_responses cr ON cr.challenge_id = c.id
      WHERE c.challenger_id = _user_id AND c.challenger_score > cr.score
  ) t;

  total_q := games * 10;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', id, 'category', category, 'question', question, 'created_at', created_at
  )), '[]'::jsonb)
  INTO submissions_list
  FROM (
    SELECT id, category, question, created_at
    FROM questions
    WHERE submitted_by = _user_id AND is_approved = true
    ORDER BY created_at DESC LIMIT 50
  ) s;

  SELECT COALESCE(jsonb_agg(a ORDER BY (a->>'created_at') DESC), '[]'::jsonb)
  INTO activity_list
  FROM (
    SELECT jsonb_build_object('type','score','category',category,'value',score,'created_at',created_at) AS a
      FROM (SELECT category, score, created_at FROM scores WHERE user_id = _user_id ORDER BY created_at DESC LIMIT 10) x
    UNION ALL
    SELECT jsonb_build_object('type','submission_approved','category',category,'question',question,'created_at',created_at) AS a
      FROM (SELECT category, question, created_at FROM questions WHERE submitted_by = _user_id AND is_approved = true ORDER BY created_at DESC LIMIT 10) y
    UNION ALL
    SELECT jsonb_build_object('type','og_vote','vote',vote,'created_at',created_at) AS a
      FROM (SELECT vote, created_at FROM og_votes WHERE og_user_id = _user_id ORDER BY created_at DESC LIMIT 10) z
  ) combined;

  RETURN jsonb_build_object(
    'user_id', prof.user_id,
    'display_name', prof.display_name,
    'initials', prof.initials,
    'avatar_id', prof.avatar_id,
    'is_og', prof.is_og,
    'quiz_points', quiz_pts,
    'submission_points', sub_pts,
    'vote_points', vote_pts,
    'challenge_points', chal_pts,
    'total_points', quiz_pts + sub_pts + vote_pts + chal_pts,
    'games_played', games,
    'approved_submissions_count', approved,
    'accuracy', CASE WHEN total_q > 0 THEN ROUND((quiz_pts::numeric / total_q::numeric) * 100, 1) ELSE 0 END,
    'approved_submissions', submissions_list,
    'recent_activity', activity_list
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_player_stats(uuid) TO anon, authenticated;
