import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import projectDoor from '@/assets/project-door.jpg';

interface SignupScreenProps {
  onComplete: () => void;
}

export function SignupScreen({ onComplete }: SignupScreenProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [doorsOpen, setDoorsOpen] = useState(false);
  const { signUp, signIn } = useAuth();

  const handleOpenDoors = () => {
    setDoorsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (result.error) {
        setError(result.error.message);
      } else {
        onComplete();
      }
    } catch (err) {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Dark backdrop */}
      <div className="absolute inset-0 bg-black" />

      {/* Signup form - revealed behind doors */}
      <div className="absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-b from-amber-900/90 to-stone-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: doorsOpen ? 1 : 0, scale: doorsOpen ? 1 : 0.9 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🧠</div>
            <h2 className="font-display text-2xl text-gray-900">
              {isLogin ? 'WELCOME BACK' : 'ENTER THE BUILDING'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {isLogin ? 'Sign in to continue' : 'Quick signup to play'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-100 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl py-6"
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-100 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl py-6"
                required
                minLength={6}
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-destructive text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              className="w-full font-display text-lg py-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
              disabled={loading}
            >
              {loading ? 'LOADING...' : isLogin ? 'SIGN IN' : 'LET\'S GO! 🔥'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Double doors with door image */}
      <AnimatePresence>
        {!doorsOpen && (
          <>
            {/* Left door */}
            <motion.div
              initial={{ rotateY: 0 }}
              exit={{ rotateY: -110 }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className="absolute left-0 top-0 bottom-0 w-1/2 origin-left"
              style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-right"
                style={{ 
                  backgroundImage: `url(${projectDoor})`,
                  clipPath: 'inset(0 0 0 0)',
                }}
              />
              {/* Door shadow overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
            </motion.div>

            {/* Right door */}
            <motion.div
              initial={{ rotateY: 0 }}
              exit={{ rotateY: 110 }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className="absolute right-0 top-0 bottom-0 w-1/2 origin-right"
              style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-left"
                style={{ 
                  backgroundImage: `url(${projectDoor})`,
                  clipPath: 'inset(0 0 0 0)',
                }}
              />
              {/* Door shadow overlay */}
              <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent" />
            </motion.div>

            {/* Door handles/center line */}
            <motion.div 
              exit={{ opacity: 0 }}
              className="absolute left-1/2 top-0 bottom-0 w-1 bg-black/30 -translate-x-1/2 z-10"
            />

            {/* Tap to enter overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center z-20 cursor-pointer"
              onClick={handleOpenDoors}
            >
              {/* Building number sign */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-white/90 px-6 py-2 rounded-lg mb-8 shadow-lg"
              >
                <p className="font-display text-gray-800 text-lg">🧠 HOODLINGO</p>
              </motion.div>

              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-center"
              >
                <div className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl shadow-2xl">
                  <p className="font-display text-xl">TAP TO ENTER</p>
                  <p className="text-sm opacity-80 mt-1">Welcome to the building</p>
                </div>
              </motion.div>

              {/* Metal railings decoration */}
              <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-1 h-16 bg-gray-600 rounded-full" />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
