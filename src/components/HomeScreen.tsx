import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { avatars, getAvatarById } from '@/data/avatars';

interface HomeScreenProps {
  onCategorySelect: (category: string) => void;
  onMenuClick: () => void;
}

const categories = [
  { id: 'rap', name: 'Rap', color: 'bg-yellow-400 text-black' },
  { id: 'streets', name: 'These Streets', color: 'bg-red-500 text-white' },
  { id: 'flicks', name: 'Hood Flicks', color: 'bg-purple-500 text-white' },
  { id: 'stores', name: 'Corner Stores', color: 'bg-green-500 text-white' },
];

export function HomeScreen({ onCategorySelect, onMenuClick }: HomeScreenProps) {
  const { profile, user } = useAuth();
  const avatar = getAvatarById(profile?.avatar_id || 'avatar1') || avatars[0];

  return (
    <div className="min-h-screen home-gradient flex flex-col">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-white hover:bg-white/10"
        >
          <Menu className="h-6 w-6" />
        </Button>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`h-10 w-10 rounded-full ${avatar.style} flex items-center justify-center text-lg border-2 border-white/30`}
        >
          {avatar.emoji}
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 pb-16">
        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div 
            className="text-6xl mb-4"
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            🧠
          </motion.div>
          <h1 className="font-display text-5xl text-white tracking-wide mb-3">
            HOODLINGO
          </h1>
          <p className="text-white/80 text-sm font-medium tracking-wide uppercase">
            IF YOU AIN'T NEVER WORN TIMBS,
          </p>
        </motion.div>

        {/* "What Do You Really Know About?" */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white text-xl font-medium mb-6"
        >
          What Do You Really Know About?
        </motion.p>

        {/* Category Buttons */}
        <div className="flex flex-wrap justify-center gap-3 max-w-sm">
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCategorySelect(category.id)}
              disabled={category.id !== 'rap'}
              className={`
                ${category.color} 
                px-6 py-3 rounded-full font-bold text-sm
                shadow-lg transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                ${category.id === 'rap' ? 'ring-2 ring-white/50' : ''}
              `}
            >
              {category.name}
              {category.id !== 'rap' && (
                <span className="ml-1 opacity-70">(Soon)</span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Games played indicator */}
        {profile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-10 text-center"
          >
            <p className="text-white/60 text-sm">
              Games played: <span className="text-white font-bold">{profile.games_played || 0}</span>
            </p>
            {!profile.has_paid && (profile.games_played || 0) >= 2 && (
              <p className="text-yellow-300 text-xs mt-1">
                🔒 Unlock unlimited games for $1!
              </p>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
