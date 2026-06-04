import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useLeaderboard, Timeframe } from '@/hooks/useLeaderboard';
import { LeaderboardTable } from '@/components/competition/LeaderboardTable';

const CATEGORIES = [
  { id: null, label: 'ALL' },
  { id: 'rap', label: 'RAP' },
  { id: 'streets', label: 'STREETS' },
  { id: 'flicks', label: 'FLICKS' },
  { id: 'stores', label: 'STORES' },
];

export default function Competition() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<Timeframe>('all_time');
  const [category, setCategory] = useState<string | null>(null);
  const { data: rows = [], isLoading } = useLeaderboard(timeframe, category);

  return (
    <div className="min-h-screen bg-background pb-safe">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Trophy className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl text-primary">COMPETITION</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as Timeframe)}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="all_time" className="font-display">ALL-TIME</TabsTrigger>
            <TabsTrigger value="weekly" className="font-display">WEEKLY</TabsTrigger>
            <TabsTrigger value="monthly" className="font-display">MONTHLY</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-1 px-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.id ?? 'all'}
              onClick={() => setCategory(c.id)}
              className={`px-4 py-1.5 rounded-full font-display text-sm whitespace-nowrap transition-colors ${
                category === c.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card/60 overflow-hidden">
          <LeaderboardTable rows={rows} currentUserId={user?.id} isLoading={isLoading} />
        </div>

        <p className="text-center text-xs text-muted-foreground px-4">
          Points: 1 per quiz point · +10 per approved question · +5 per challenge win · +1 per OG vote
        </p>
      </main>
    </div>
  );
}
