import { formatDistanceToNow } from 'date-fns';
import { Mic, Lightbulb, ThumbsUp } from 'lucide-react';

interface ActivityItem {
  type: string;
  created_at: string;
  category?: string;
  value?: number;
  question?: string;
  vote?: boolean;
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (!items?.length) {
    return (
      <p className="text-center text-muted-foreground text-sm py-6">No recent activity yet.</p>
    );
  }
  return (
    <ul className="space-y-2">
      {items.slice(0, 15).map((item, i) => (
        <li key={i} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
          <div className="mt-0.5">
            {item.type === 'score' && <Mic className="h-4 w-4 text-primary" />}
            {item.type === 'submission_approved' && <Lightbulb className="h-4 w-4 text-accent" />}
            {item.type === 'og_vote' && <ThumbsUp className="h-4 w-4 text-success" />}
          </div>
          <div className="flex-1 min-w-0">
            {item.type === 'score' && (
              <p className="text-sm">
                Scored <span className="font-heading text-primary">{item.value}</span> in{' '}
                <span className="uppercase text-muted-foreground">{item.category}</span>
              </p>
            )}
            {item.type === 'submission_approved' && (
              <p className="text-sm truncate">
                Question approved:{' '}
                <span className="text-foreground">"{item.question}"</span>
              </p>
            )}
            {item.type === 'og_vote' && (
              <p className="text-sm">
                Cast an OG {item.vote ? 'YES' : 'NO'} vote
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
