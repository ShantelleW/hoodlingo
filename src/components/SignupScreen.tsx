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
  const [doorOpen, setDoorOpen] = useState(false);
  const { signUp, signIn } = useAuth();

  const handleOpenDoor = () => {
    setDoorOpen(true);
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
      className="fixed inset-0 z-50"
      style={{ perspective: '1200px' }}
    >
      {/* Dark lobby interior behind door */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950 via-stone-900 to-black" />
      
      {/* Dim lobby lighting effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl" />

      {/* Signup form - inside the lobby */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: doorOpen ? 1 : 0, y: doorOpen ? 0 : 30 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="w-full max-w-sm bg-white/95 backdrop-blur rounded-2xl p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🧠</div>
            <h2 className="font-display text-2xl text-gray-900">
              {isLogin ? 'WELCOME BACK' : 'YOU\'RE IN'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {isLogin ? 'Sign in to continue' : 'Sign up to play'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-100 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl py-6"
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-100 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl py-6"
              required
              minLength={6}
            />

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

      {/* Single door that swings open */}
      <AnimatePresence>
        {!doorOpen && (
          <motion.div
            initial={{ rotateY: 0 }}
            exit={{ rotateY: -95 }}
            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 origin-left"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Door image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${projectDoor})` }}
            />
            
            {/* Door edge shadow when swinging */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/40 to-transparent" />

            {/* Tap to enter overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ delay: 0.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
              onClick={handleOpenDoor}
            >
              {/* HOODLINGO sign */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute top-24 bg-white/90 px-6 py-3 rounded-lg shadow-xl"
              >
                <p className="font-display text-gray-800 text-xl tracking-wide">🧠 HOODLINGO</p>
              </motion.div>

              {/* Enter button */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mt-20"
              >
                <div className="bg-primary text-primary-foreground px-10 py-5 rounded-2xl shadow-2xl border-2 border-primary-foreground/20">
                  <p className="font-display text-2xl">BUZZ IN 🔔</p>
                  <p className="text-sm opacity-80 mt-1 text-center">Tap to enter</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
