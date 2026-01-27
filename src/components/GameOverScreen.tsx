import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { avatars, Avatar } from '@/data/avatars';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface LeaderboardEntry {
  id: string;
  initials: string;
  avatar_id: string;
  score: number;
  created_at: string;
}

interface GameOverScreenProps {
  score: number;
  totalQuestions: number;
  category: string;
  onPlayAgain: () => void;
  onGoHome: () => void;
  onChallenge: () => void;
  onSubmitQuestion: () => void;
}

export function GameOverScreen({
  score,
  totalQuestions,
  category,
  onPlayAgain,
  onGoHome,
  onChallenge,
  onSubmitQuestion
}: GameOverScreenProps) {
  const { user, profile, updateProfile } = useAuth();
  const [initials, setInitials] = useState(profile?.initials || '');
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar>(
    avatars.find(a => a.id === profile?.avatar_id) || avatars[0]
  );
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, [category]);

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('category', category)
      .order('score', { ascending: false })
      .limit(10);
    
    if (data) {
      setLeaderboard(data);
    }
  };

  const handleSubmitScore = async () => {
    if (!user || initials.length !== 3 || hasSubmitted) return;
    
    setIsLoading(true);
    try {
      // Save score
      await supabase.from('scores').insert({
        user_id: user.id,
        initials: initials.toUpperCase(),
        avatar_id: selectedAvatar.id,
        score,
        category
      });

      // Update profile with initials and avatar
      await updateProfile({
        initials: initials.toUpperCase(),
        avatar_id: selectedAvatar.id
      });

      setHasSubmitted(true);
      await fetchLeaderboard();
    } catch (error) {
      console.error('Error submitting score:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Arcade-style background */}
      <div className="fixed inset-0 bg-gradient-to-b from-background via-secondary to-background" />
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 50px, hsl(var(--primary) / 0.1) 50px, hsl(var(--primary) / 0.1) 51px),
                           repeating-linear-gradient(90deg, transparent, transparent 50px, hsl(var(--primary) / 0.1) 50px, hsl(var(--primary) / 0.1) 51px)`
        }} />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center p-6 overflow-hidden">
        {/* Game Over Title */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center mb-6"
        >
          <h1 className="font-heading text-5xl arcade-text tracking-widest">GAME OVER</h1>
          <div className="text-4xl mt-2">{score >= totalQuestions / 2 ? '🔥' : '💀'}</div>
        </motion.div>

        {/* Score Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="arcade-border rounded-xl p-6 mb-6 text-center bg-card/80"
        >
          <p className="text-muted-foreground text-sm">YOUR SCORE</p>
          <p className="font-heading text-6xl text-primary">{score}</p>
          <p className="text-muted-foreground text-sm">OUT OF {totalQuestions}</p>
        </motion.div>

        {/* Enter Initials (if not submitted) */}
        {!hasSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-sm mb-6"
          >
            <p className="text-center text-muted-foreground mb-3">ENTER YOUR INITIALS</p>
            <Input
              value={initials}
              onChange={(e) => setInitials(e.target.value.slice(0, 3).toUpperCase())}
              placeholder="AAA"
              maxLength={3}
              className="text-center font-heading text-4xl h-16 bg-secondary border-primary tracking-[0.5em]"
            />
          </motion.div>
        )}

        {/* Avatar Selection (if not submitted) */}
        {!hasSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-sm mb-6"
          >
            <p className="text-center text-muted-foreground mb-3">CHOOSE YOUR AVATAR</p>
            <div className="grid grid-cols-4 gap-3">
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`aspect-square rounded-xl ${avatar.style} flex items-center justify-center text-2xl transition-all ${
                    selectedAvatar.id === avatar.id ? 'avatar-ring scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {avatar.emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Submit Score Button */}
        {!hasSubmitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="w-full max-w-sm mb-6"
          >
            <Button
              onClick={handleSubmitScore}
              disabled={initials.length !== 3 || isLoading}
              className="w-full font-display text-lg py-6 bg-primary text-primary-foreground"
            >
              {isLoading ? 'SAVING...' : 'SUBMIT SCORE'}
            </Button>
          </motion.div>
        )}

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: hasSubmitted ? 0.2 : 0.6 }}
          className="w-full max-w-sm flex-1 overflow-hidden"
        >
          <h3 className="font-heading text-2xl text-center text-primary mb-4">HIGH SCORES</h3>
          <div className="arcade-border rounded-xl bg-card/50 overflow-hidden">
            <div className="divide-y divide-border">
              {leaderboard.length > 0 ? (
                leaderboard.map((entry, index) => {
                  const avatar = avatars.find(a => a.id === entry.avatar_id) || avatars[0];
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-heading text-2xl text-primary w-8">
                          {index + 1}.
                        </span>
                        <div className={`w-8 h-8 rounded-full ${avatar.style} flex items-center justify-center text-sm`}>
                          {avatar.emoji}
                        </div>
                        <span className="font-heading text-xl tracking-widest">
                          {entry.initials}
                        </span>
                      </div>
                      <span className="font-heading text-2xl text-primary">
                        {entry.score}
                      </span>
                    </motion.div>
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No scores yet. Be the first!
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="w-full max-w-sm mt-6 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={onChallenge}
              variant="outline"
              className="font-display py-5 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              📱 CHALLENGE
            </Button>
            <Button
              onClick={onSubmitQuestion}
              variant="outline"
              className="font-display py-5 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              ➕ SUBMIT Q
            </Button>
          </div>
          <Button
            onClick={onPlayAgain}
            className="w-full font-display text-lg py-6 bg-primary text-primary-foreground pulse-glow"
          >
            PLAY AGAIN
          </Button>
          <Button
            onClick={onGoHome}
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            Back to Home
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
