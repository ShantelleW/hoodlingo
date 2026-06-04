import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

// Called by pg_cron weekly. Computes leaderboard delta per user and enqueues digest emails.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const service = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Current week and previous week leaderboards
    const { data: thisWeek } = await service.rpc('get_leaderboard', { _timeframe: 'weekly' });
    const { data: allTime } = await service.rpc('get_leaderboard', { _timeframe: 'all_time' });

    const thisMap = new Map((thisWeek || []).map((r: any) => [r.user_id, r]));
    const allMap = new Map((allTime || []).map((r: any) => [r.user_id, r]));

    // Eligible profiles
    const { data: profiles } = await service
      .from('profiles')
      .select('user_id, email, display_name, notify_digest, games_played')
      .not('email', 'is', null)
      .eq('notify_digest', true);

    let queued = 0;
    let skipped = 0;

    for (const p of (profiles || [])) {
      try {
        const weekRow: any = thisMap.get(p.user_id);
        const allRow: any = allMap.get(p.user_id);
        const rank = allRow?.rank ?? null;
        const weeklyPoints = weekRow?.total_points ?? 0;
        const trend = weeklyPoints > 0 ? 'up' : 'down';

        const subject = trend === 'down'
          ? `Your score went down... get back on top easy, Jefé 👑`
          : `🔥 You're climbing the ranks, Jefé!`;

        const { error } = await service.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'weekly-digest',
            recipientEmail: p.email,
            subject,
            idempotencyKey: `digest-${p.user_id}-${new Date().toISOString().slice(0, 10)}`,
            templateData: {
              name: p.display_name || 'Jefé',
              rank,
              weeklyPoints,
              totalPoints: allRow?.total_points ?? 0,
              gamesPlayed: p.games_played || 0,
              trend,
            },
          },
        });
        if (error) { skipped++; console.warn('enqueue failed', p.user_id, error); }
        else queued++;
      } catch (e) {
        skipped++;
        console.warn('user error', p.user_id, e);
      }
    }

    // mark last_digest_sent_at
    await service.from('profiles').update({ last_digest_sent_at: new Date().toISOString() })
      .not('email', 'is', null).eq('notify_digest', true);

    return new Response(JSON.stringify({ ok: true, queued, skipped }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
