import { Mic, Lightbulb, ThumbsUp, Swords } from 'lucide-react';

interface Props {
  quiz: number;
  submissions: number;
  votes: number;
  challenges: number;
}

const Item = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Mic;
  label: string;
  value: number;
  color: string;
}) => (
  <div className="flex items-center gap-3 p-3 bg-secondary/60 rounded-xl">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="flex-1">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="font-heading text-2xl leading-none">{value}</p>
    </div>
  </div>
);

export function PointsBreakdownCard({ quiz, submissions, votes, challenges }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Item icon={Mic} label="Quiz" value={quiz} color="bg-primary/20 text-primary" />
      <Item icon={Lightbulb} label="Approved" value={submissions} color="bg-accent/20 text-accent" />
      <Item icon={Swords} label="Challenges" value={challenges} color="bg-destructive/20 text-destructive" />
      <Item icon={ThumbsUp} label="OG Votes" value={votes} color="bg-success/20 text-success" />
    </div>
  );
}
