import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Crown, Trophy, Medal } from 'lucide-react';
import { avatars } from '@/data/avatars';
import { LeaderboardRow as Row } from '@/hooks/useLeaderboard';

interface Props {
  row: Row;
  index: number;
  highlight?: boolean;
}

const rankAccent = (rank: number) => {
  if (rank === 1) return 'text-yellow-400';
  if (rank === 2) return 'text-gray-300';
  if (rank === 3) return 'text-amber-700';
  return 'text-muted-foreground';
};

const RankIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />;
  if (rank === 2) return <Trophy className="h-5 w-5 text-gray-300" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
  return null;
};

export function LeaderboardRow({ row, index, highlight }: Props) {
  const navigate = useNavigate();
  const avatar = avatars.find((a) => a.id === row.avatar_id) || avatars[0];

  return (
    <motion.button
      onClick={() => navigate(`/player/${row.user_id}`)}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.4) }}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/60 ${
        highlight ? 'bg-primary/10 border-l-4 border-primary' : ''
      }`}
    >
      <div className="flex items-center gap-2 w-14">
        <span className={`font-heading text-2xl ${rankAccent(row.rank)}`}>
          {row.rank}
        </span>
        <RankIcon rank={row.rank} />
      </div>
      <div className={`w-10 h-10 rounded-full ${avatar.style} flex items-center justify-center text-lg shrink-0`}>
        {avatar.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-heading text-xl tracking-widest truncate">
          {row.initials || '???'}
        </p>
        <p className="text-xs text-muted-foreground">
          {row.games_played} games · {row.approved_submissions} approved
        </p>
      </div>
      <div className="text-right">
        <p className="font-heading text-2xl text-primary leading-none">{row.total_points}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">pts</p>
      </div>
    </motion.button>
  );
}
