import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, LogOut, Crown, Trophy, Lightbulb, Swords, ChevronRight, Clock, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { avatars, getAvatarById } from '@/data/avatars';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface ChallengeHistoryItem {
  id: string;
  type: 'sent' | 'received';
  category: string;
  myScore: number;
  theirScore: number | null;
  theirInitials: string | null;
  createdAt: string;
  won: boolean | null;
}

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onViewLeaderboard: () => void;
  onSubmitQuestion?: () => void;
}

export function SideMenu({ isOpen, onClose, onViewLeaderboard, onSubmitQuestion }: SideMenuProps) {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const avatar = getAvatarById(profile?.avatar_id || 'avatar1') || avatars[0];
  const [challengeHistory, setChallengeHistory] = useState<ChallengeHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchChallengeHistory();
      checkAdminStatus();
    }
  }, [isOpen, user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    const { data } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });
    setIsAdmin(data || false);
  };

  const fetchChallengeHistory = async () => {
    if (!user) return;
    
    setIsLoadingHistory(true);
    try {
      const history: ChallengeHistoryItem[] = [];

      // Fetch challenges I sent
      const { data: sentChallenges } = await supabase
        .from('challenges')
        .select('*')
        .eq('challenger_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (sentChallenges) {
        for (const challenge of sentChallenges) {
          // Get responses to this challenge
          const { data: responses } = await supabase
            .from('challenge_responses')
            .select('score, responder_id')
            .eq('challenge_id', challenge.id)
            .limit(1);

          let theirInitials = null;
          let theirScore = null;

          if (responses && responses.length > 0) {
            theirScore = responses[0].score;
            // Get responder's initials
            const { data: responderProfile } = await supabase
              .from('profiles')
              .select('initials')
              .eq('user_id', responses[0].responder_id)
              .single();
            theirInitials = responderProfile?.initials || null;
          }

          history.push({
            id: challenge.id,
            type: 'sent',
            category: challenge.category,
            myScore: challenge.challenger_score,
            theirScore,
            theirInitials,
            createdAt: challenge.created_at,
            won: theirScore !== null ? challenge.challenger_score > theirScore : null
          });
        }
      }

      // Fetch challenges I responded to
      const { data: myResponses } = await supabase
        .from('challenge_responses')
        .select('*, challenges(*)')
        .eq('responder_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (myResponses) {
        for (const response of myResponses) {
          const challenge = response.challenges as any;
          if (!challenge) continue;

          // Get challenger's initials
          const { data: challengerProfile } = await supabase
            .from('profiles')
            .select('initials')
            .eq('user_id', challenge.challenger_id)
            .single();

          history.push({
            id: response.id,
            type: 'received',
            category: challenge.category,
            myScore: response.score,
            theirScore: challenge.challenger_score,
            theirInitials: challengerProfile?.initials || null,
            createdAt: response.created_at,
            won: response.score > challenge.challenger_score
          });
        }
      }

      // Sort by date
      history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setChallengeHistory(history.slice(0, 10));
    } catch (error) {
      console.error('Error fetching challenge history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Menu */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="fixed top-0 left-0 bottom-0 z-50 w-80 bg-card border-r border-border overflow-hidden"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="font-display text-2xl text-primary">MENU</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6">
            {/* Profile Section */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-secondary rounded-xl">
              <div className={`w-14 h-14 rounded-full ${avatar.style} flex items-center justify-center text-2xl`}>
                {avatar.emoji}
              </div>
              <div>
                <p className="font-heading text-xl">
                  {profile?.initials || user?.email?.slice(0, 3).toUpperCase() || 'YOU'}
                </p>
                <p className="text-muted-foreground text-sm">
                  {profile?.games_played || 0} games played
                </p>
                {profile?.is_og && (
                  <span className="inline-flex items-center gap-1 text-primary text-xs mt-1">
                    <Crown className="h-3 w-3" /> OG MEMBER
                  </span>
                )}
              </div>
            </div>

            {/* Menu Items */}
            <nav className="space-y-2 mb-6">
              <Button
                variant="ghost"
                onClick={onViewLeaderboard}
                className="w-full justify-start font-display text-lg"
              >
                <Trophy className="mr-3 h-5 w-5 text-primary" />
                LEADERBOARD
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  onClose();
                  onSubmitQuestion?.();
                }}
                className="w-full justify-start font-display text-lg"
              >
                <Lightbulb className="mr-3 h-5 w-5 text-accent" />
                SUBMIT A HOOD FACT
              </Button>

              {isAdmin && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    onClose();
                    navigate('/admin');
                  }}
                  className="w-full justify-start font-display text-lg"
                >
                  <Settings className="mr-3 h-5 w-5 text-primary" />
                  ADMIN DASHBOARD
                </Button>
              )}

              {profile?.has_paid && (
                <div className="p-4 bg-success/10 rounded-xl mt-4">
                  <p className="text-success font-bold text-sm flex items-center gap-2">
                    ✓ UNLIMITED ACCESS
                  </p>
                </div>
              )}
            </nav>

            {/* Challenge History Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Swords className="h-5 w-5 text-accent" />
                <h3 className="font-display text-lg text-accent">CHALLENGE HISTORY</h3>
              </div>

              {isLoadingHistory ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground text-sm">Loading...</p>
                </div>
              ) : challengeHistory.length === 0 ? (
                <div className="text-center py-4 bg-secondary/50 rounded-xl">
                  <p className="text-muted-foreground text-sm">No challenges yet</p>
                  <p className="text-muted-foreground text-xs mt-1">Challenge a friend after your next game!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {challengeHistory.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-secondary/50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            item.type === 'sent' 
                              ? 'bg-primary/20 text-primary' 
                              : 'bg-accent/20 text-accent'
                          }`}>
                            {item.type === 'sent' ? '📤 SENT' : '📥 RECEIVED'}
                          </span>
                          <span className="text-xs text-muted-foreground uppercase">
                            {item.category}
                          </span>
                        </div>
                        {item.won !== null && (
                          <span className={`text-sm ${item.won ? 'text-success' : 'text-destructive'}`}>
                            {item.won ? '🏆 W' : '❌ L'}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">YOU</p>
                            <p className="font-heading text-lg">{item.myScore}</p>
                          </div>
                          <span className="text-muted-foreground">vs</span>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">
                              {item.theirInitials || '???'}
                            </p>
                            <p className="font-heading text-lg">
                              {item.theirScore !== null ? item.theirScore : '—'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground text-xs">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: false })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 pt-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={() => signOut()}
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
