import { motion } from 'framer-motion';
import { Menu, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { avatars, getAvatarById } from '@/data/avatars';
import housingProjectBg from '@/assets/housing-project-bg.jpg';

interface HomeScreenProps {
  onCategorySelect: (category: string) => void;
  onMenuClick: () => void;
}

const categories = [
  { id: 'rap', name: 'Rap', color: 'bg-yellow-400 text-gray-900' },
  { id: 'streets', name: 'These Streets', color: 'bg-orange-400 text-white' },
  { id: 'flicks', name: 'Hood Flicks', color: 'bg-orange-500 text-white' },
  { id: 'stores', name: 'Corner Stores', color: 'bg-cyan-500 text-white' },
];

export function HomeScreen({ onCategorySelect, onMenuClick }: HomeScreenProps) {
  const { profile } = useAuth();
  const avatar = getAvatarById(profile?.avatar_id || 'avatar1') || avatars[0];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Urban project background - top half */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${housingProjectBg})`,
        }}
      />
      
      {/* Gradient overlay for bottom section */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-100" 
           style={{ top: '40%' }} 
      />
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-slate-100" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="text-gray-800 bg-white/80 hover:bg-white gap-2 rounded-lg"
        >
          <Menu className="h-5 w-5" />
          <span className="font-medium">Menu</span>
        </Button>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative"
        >
          <div className={`h-12 w-12 rounded-full ${avatar.style} flex items-center justify-center text-xl border-2 border-white shadow-lg`}>
            {avatar.emoji}
          </div>
          {profile?.has_paid && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
              <Crown className="w-3 h-3 text-white" />
            </div>
          )}
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col">
        {/* Logo Section - in the image area */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 pt-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Brain Logo */}
            <motion.div 
              className="w-24 h-24 mx-auto mb-4 bg-white/90 rounded-3xl flex items-center justify-center shadow-xl"
              animate={{ rotate: [0, -3, 3, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            >
              <span className="text-5xl">🧠</span>
            </motion.div>
            
            <h1 className="font-display text-4xl text-primary tracking-wide mb-1">
              HOODLINGO
            </h1>
            <p className="text-primary/80 text-sm font-medium tracking-wide">
              SHANT-KNOWS-IT-ALL PRESENTS
            </p>
          </motion.div>
        </div>

        {/* Bottom Content - on light background */}
        <div className="bg-slate-100 px-6 pb-8 pt-6">
          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-6"
          >
            <h2 className="font-display text-2xl text-primary leading-tight mb-2">
              IF YOU AIN'T NEVER WORN TIMBS, TURN BACK!
            </h2>
            <p className="text-gray-600 text-base">
              What Do You Really Know About?
            </p>
            <div className="w-full h-px bg-gray-300 mt-4" />
          </motion.div>

          {/* Category Buttons - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onCategorySelect(category.id)}
                disabled={category.id !== 'rap'}
                className={`
                  ${category.color} 
                  px-4 py-4 rounded-xl font-bold text-base
                  shadow-md transition-all duration-200
                  disabled:opacity-60 disabled:cursor-not-allowed
                `}
              >
                {category.name}
              </motion.button>
            ))}
          </div>

          {/* Games played indicator */}
          {profile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 text-center"
            >
              {profile.has_paid ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full border border-yellow-400/30">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-600 font-bold text-sm">UNLIMITED ACCESS</span>
                </div>
              ) : (
                <>
                  <p className="text-gray-500 text-sm">
                    Games played: <span className="text-gray-800 font-bold">{profile.games_played || 0}</span>
                  </p>
                  {(profile.games_played || 0) >= 2 && (
                    <p className="text-orange-500 text-xs mt-1">
                      🔒 Unlock unlimited games for $1!
                    </p>
                  )}
                </>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
