import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import projectDoor from '@/assets/project-door.jpg';
import timbBoot from '@/assets/timb-boot-kick.png';

interface SignupScreenProps {
  onComplete: () => void;
}

export function SignupScreen({ onComplete }: SignupScreenProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [kicking, setKicking] = useState(false);
  const { signUp, signIn } = useAuth();

  const handleShowForm = () => {
    setShowForm(true);
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
        setLoading(false);
      } else {
        // Trigger kick animation on successful auth
        setKicking(true);
        // Wait for kick animation then complete
        setTimeout(() => {
          onComplete();
        }, 1500);
      }
    } catch (err) {
      setError('Something went wrong. Try again.');
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
      {/* Dark background */}
      <div className="absolute inset-0 bg-black" />

      {/* Door with bars */}
      <motion.div
        animate={kicking ? { 
          rotateY: -120,
          x: -100,
          opacity: 0
        } : {}}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="absolute inset-0 origin-left"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${projectDoor})` }}
        />
      </motion.div>

      {/* Boot kick animation - shows when kicking */}
      <AnimatePresence>
        {kicking && (
          <motion.div
            initial={{ y: '100%', x: '-20%', rotate: -30, scale: 1.5 }}
            animate={{ y: '10%', x: '0%', rotate: 0, scale: 2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none"
          >
            <img 
              src={timbBoot} 
              alt="Timb kick" 
              className="w-full max-w-lg mx-auto"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* "KICK IN THE DOOR" text on successful auth */}
      <AnimatePresence>
        {kicking && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 10 }}
            className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
          >
            <div className="text-center">
              <p className="font-display text-5xl text-primary drop-shadow-lg">
                KICK IN THE DOOR! 🚪🦵
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Signup form overlay */}
      <AnimatePresence>
        {showForm && !kicking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowForm(false)}
            />

            {/* Form */}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative z-10 w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🧠</div>
                <h2 className="font-display text-xl text-gray-900">
                  {isLogin ? 'WELCOME BACK' : 'SIGN UP TO ENTER'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-100 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl py-5"
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-100 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl py-5"
                  required
                  minLength={6}
                />

                {error && (
                  <p className="text-destructive text-sm text-center">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full font-display text-lg py-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                  disabled={loading}
                >
                  {loading ? '...' : '🥾 KICK IT IN'}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  {isLogin ? "Need an account? Sign up" : 'Already in? Sign in'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Initial door view with HOODLINGO sign */}
      {!showForm && !kicking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center z-10"
        >
          {/* HOODLINGO sign */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute top-20 bg-white px-8 py-4 rounded-xl shadow-2xl"
          >
            <p className="font-display text-2xl text-gray-900">🧠 HOODLINGO</p>
          </motion.div>

          {/* Buzz in button */}
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShowForm}
            className="bg-primary text-primary-foreground px-10 py-5 rounded-2xl shadow-2xl font-display text-xl"
          >
            🔔 BUZZ IN
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-4 text-white/60 text-sm"
          >
            Tap to enter the building
          </motion.p>
        </motion.div>
      )}
    </motion.div>
  );
}
