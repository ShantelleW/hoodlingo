import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Clock, User, Target } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChallengeIntroScreenProps {
  challengerInitials: string | null;
  challengerScore: number;
  challengedAt: string;
  category: string;
  onAccept: () => void;
  onDecline: () => void;
}

export function ChallengeIntroScreen({
  challengerInitials,
  challengerScore,
  challengedAt,
  category,
  onAccept,
  onDecline
}: ChallengeIntroScreenProps) {
  const timeAgo = formatDistanceToNow(new Date(challengedAt), { addSuffix: true });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="quiz-card w-full max-w-sm text-center"
      >
        {/* Challenge Badge */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="mb-6"
        >
          <div className="text-6xl mb-2">🎯</div>
          <h1 className="font-heading text-3xl arcade-text tracking-wider">
            YOU'VE BEEN CHALLENGED!
          </h1>
        </motion.div>

        {/* Challenger Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="arcade-border rounded-xl p-6 mb-6 bg-card/50"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-muted-foreground text-xs">CHALLENGED BY</p>
              <p className="font-heading text-2xl text-primary tracking-widest">
                {challengerInitials || '???'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                <Target className="w-3 h-3" />
                THEIR SCORE
              </div>
              <p className="font-heading text-3xl text-accent">{challengerScore}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                <Clock className="w-3 h-3" />
                PLAYED
              </div>
              <p className="font-display text-sm text-foreground">{timeAgo}</p>
            </div>
          </div>
        </motion.div>

        {/* Category Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-secondary text-foreground font-display text-sm">
            📚 {category.toUpperCase()} CATEGORY
          </span>
        </motion.div>

        {/* Challenge Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground mb-6"
        >
          You'll play the <span className="text-primary font-bold">exact same questions</span> they did.
          <br />
          Think you can beat their score?
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <Button
            onClick={onAccept}
            className="w-full font-display text-lg py-6 bg-primary text-primary-foreground pulse-glow"
          >
            🔥 ACCEPT CHALLENGE
          </Button>
          <Button
            onClick={onDecline}
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            Maybe Later
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
