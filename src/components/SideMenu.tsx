import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, LogOut, Crown, Trophy, HelpCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { avatars, getAvatarById } from '@/data/avatars';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onViewLeaderboard: () => void;
}

export function SideMenu({ isOpen, onClose, onViewLeaderboard }: SideMenuProps) {
  const { user, profile, signOut } = useAuth();
  const avatar = getAvatarById(profile?.avatar_id || 'avatar1') || avatars[0];

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
        className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-card border-r border-border"
      >
        <div className="flex flex-col h-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl text-primary">MENU</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Profile Section */}
          <div className="flex items-center gap-4 mb-8 p-4 bg-secondary rounded-xl">
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
          <nav className="flex-1 space-y-2">
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
              className="w-full justify-start font-display text-lg"
              disabled
            >
              <HelpCircle className="mr-3 h-5 w-5" />
              HOW TO PLAY
            </Button>

            {profile?.has_paid && (
              <div className="p-4 bg-success/10 rounded-xl mt-4">
                <p className="text-success font-bold text-sm flex items-center gap-2">
                  ✓ UNLIMITED ACCESS
                </p>
              </div>
            )}
          </nav>

          {/* Footer */}
          <div className="pt-4 border-t border-border">
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
