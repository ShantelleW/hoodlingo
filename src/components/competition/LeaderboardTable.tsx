import { LeaderboardRow as Row, LeaderboardRow as RowType } from '@/hooks/useLeaderboard';
import { LeaderboardRow } from './LeaderboardRow';

interface Props {
  rows: RowType[];
  currentUserId?: string;
  isLoading: boolean;
}

export function LeaderboardTable({ rows, currentUserId, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="py-12 text-center text-muted-foreground">Loading leaderboard…</div>
    );
  }
  if (!rows.length) {
    return (
      <div className="py-12 text-center">
        <p className="font-heading text-2xl text-muted-foreground">NO SCORES YET</p>
        <p className="text-sm text-muted-foreground mt-2">Play a game to climb the board!</p>
      </div>
    );
  }
  return (
    <div className="divide-y divide-border">
      {rows.map((row, i) => (
        <LeaderboardRow
          key={row.user_id}
          row={row}
          index={i}
          highlight={row.user_id === currentUserId}
        />
      ))}
    </div>
  );
}
