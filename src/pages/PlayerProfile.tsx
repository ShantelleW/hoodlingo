import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { avatars } from '@/data/avatars';
import { usePlayerStats } from '@/hooks/usePlayerStats';
import { PointsBreakdownCard } from '@/components/competition/PointsBreakdownCard';
import { ActivityFeed } from '@/components/competition/ActivityFeed';

export default function PlayerProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data: stats, isLoading } = usePlayerStats(userId);

  const avatar = avatars.find((a) => a.id === stats?.avatar_id) || avatars[0];

  return (
    <div className="min-h-screen bg-background pb-safe">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display text-xl text-primary">PLAYER</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-5">
        {isLoading || !stats ? (
          <p className="text-center text-muted-foreground py-12">Loading…</p>
        ) : (
          <>
            <div className="flex items-center gap-4 p-4 bg-secondary rounded-2xl">
              <div className={`w-20 h-20 rounded-full ${avatar.style} flex items-center justify-center text-4xl`}>
                {avatar.emoji}
              </div>
              <div className="flex-1">
                <p className="font-heading text-4xl tracking-widest">
                  {stats.initials || '???'}
                </p>
                {stats.is_og && (
                  <span className="inline-flex items-center gap-1 text-primary text-xs mt-1">
                    <Crown className="h-3 w-3" /> OG MEMBER
                  </span>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.games_played} games · {stats.accuracy}% accuracy
                </p>
              </div>
              <div className="text-right">
                <p className="font-heading text-4xl text-primary leading-none">
                  {stats.total_points}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">total pts</p>
              </div>
            </div>

            <section>
              <h2 className="font-display text-lg text-primary mb-2">POINTS BREAKDOWN</h2>
              <PointsBreakdownCard
                quiz={stats.quiz_points}
                submissions={stats.submission_points}
                votes={stats.vote_points}
                challenges={stats.challenge_points}
              />
            </section>

            <section>
              <h2 className="font-display text-lg text-primary mb-2">
                APPROVED QUESTIONS ({stats.approved_submissions_count})
              </h2>
              {stats.approved_submissions?.length ? (
                <ul className="space-y-2">
                  {stats.approved_submissions.map((s) => (
                    <li key={s.id} className="p-3 bg-secondary/50 rounded-lg">
                      <p className="text-xs text-accent uppercase tracking-wider mb-1">
                        {s.category}
                      </p>
                      <p className="text-sm">{s.question}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No approved questions yet.</p>
              )}
            </section>

            <section>
              <h2 className="font-display text-lg text-primary mb-2">RECENT ACTIVITY</h2>
              <ActivityFeed items={(stats.recent_activity as any[]) || []} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
