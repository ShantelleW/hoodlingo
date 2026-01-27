import { motion } from 'framer-motion';
import { Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { avatars, getAvatarById } from '@/data/avatars';

interface HomeScreenProps {
  onCategorySelect: (category: string) => void;
  onMenuClick: () => void;
}

const categories = [
  { id: 'rap', name: 'RAP', className: 'category-btn-rap', emoji: '🎤' },
  { id: 'streets', name: 'THESE STREETS', className: 'category-btn-streets', emoji: '🏘️' },
  { id: 'flicks', name: 'HOOD FLICKS', className: 'category-btn-flicks', emoji: '🎬' },
  { id: 'stores', name: 'CORNER STORES', className: 'category-btn-stores', emoji: '🏪' },
];

export function HomeScreen({ onCategorySelect, onMenuClick }: HomeScreenProps) {
  const { profile, user } = useAuth();
  const avatar = getAvatarById(profile?.avatar_id || 'avatar1') || avatars[0];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Urban background */}
      <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800')] bg-cover bg-center opacity-30" />
      <div className="fixed inset-0 urban-gradient" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-foreground"
        >
          <Menu className="h-6 w-6" />
        </Button>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`h-10 w-10 rounded-full ${avatar.style} flex items-center justify-center text-lg`}
        >
          {avatar.emoji}
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">🧠</div>
          <h1 className="font-display text-5xl text-primary tracking-wider mb-2">
            HOODLINGO
          </h1>
          <p className="text-muted-foreground text-sm font-medium tracking-wide">
            IF YOU AIN'T NEVER WORN TIMBS, TURN BACK!
          </p>
        </motion.div>

        {/* Category Buttons */}
        <div className="w-full max-w-xs space-y-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => onCategorySelect(category.id)}
                className={`category-btn ${category.className} w-full flex items-center justify-center gap-3`}
                disabled={category.id !== 'rap'} // Only rap is enabled for now
              >
                <span className="text-2xl">{category.emoji}</span>
                <span>{category.name}</span>
                {category.id !== 'rap' && (
                  <span className="text-xs opacity-70">(SOON)</span>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Games played indicator */}
        {profile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-muted-foreground text-sm">
              Games played: <span className="text-primary font-bold">{profile.games_played || 0}</span>
            </p>
            {!profile.has_paid && profile.games_played >= 2 && (
              <p className="text-accent text-xs mt-1">
                🔒 Unlock unlimited games for $1!
              </p>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
