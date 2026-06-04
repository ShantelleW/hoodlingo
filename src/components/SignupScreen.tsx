import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
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

  const handleShowForm = async () => {
    // Kick the door in first, then reveal the signup form
    setKicking(true);
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch {
      // Haptics not available (browser)
    }
    // Second thud as the door swings open
    setTimeout(() => {
      try {
        Haptics.impact({ style: ImpactStyle.Medium });
      } catch {
        // Haptics not available (browser)
      }
    }, 200);
    setTimeout(() => {
      setShowForm(true);
      setKicking(false);
    }, 1100);
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
        // Auth success — just complete (door already kicked in)
        setTimeout(() => onComplete(), 300);
      }
    } catch (err) {
      setError('Something went wrong. Try again.');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        x: kicking ? [0, -15, 12, -8, 5, -3, 0] : 0,
        y: kicking ? [0, -8, 6, -4, 2, 0] : 0,
      }}
      exit={{ opacity: 0 }}
      transition={kicking ? { 
        x: { duration: 0.5, ease: 'easeOut', delay: 0.15 },
        y: { duration: 0.5, ease: 'easeOut', delay: 0.15 }
      } : {}}
      className="fixed inset-0 z-50"
      style={{ perspective: '1200px' }}
    >
      {/* Dark background */}
      <div className="absolute inset-0 bg-black" />

      {/* Door with bars */}
      <motion.div
        animate={kicking ? { 
          rotateY: -110,
          x: '-40%',
          opacity: 0,
          scale: 1.1,
        } : {}}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
        className="absolute inset-0 origin-left"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${projectDoor})` }}
        />
        
        {/* Impact flash on door */}
        <AnimatePresence>
          {kicking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0] }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-white"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* POV Boot kick animation - comes from viewer's perspective */}
      <AnimatePresence>
        {kicking && (
          <motion.div
            initial={{ 
              y: '120%', 
              scale: 0.5,
              rotate: -45,
            }}
            animate={{ 
              y: ['120%', '15%', '25%'],
              scale: [0.5, 2.5, 2.2],
              rotate: [-45, 15, 5],
            }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ 
              duration: 0.4, 
              ease: [0.22, 1, 0.36, 1],
              times: [0, 0.6, 1]
            }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
            style={{ transformOrigin: 'bottom center' }}
          >
            <img 
              src={timbBoot} 
              alt="Timb kick" 
              className="w-[80vw] max-w-2xl drop-shadow-2xl"
              style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.8))' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* "KICK IN THE DOOR" text on successful auth */}
      <AnimatePresence>
        {kicking && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', damping: 8, stiffness: 200 }}
            className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
          >
            <div className="text-center">
              <motion.p 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: 2, duration: 0.15 }}
                className="font-display text-5xl md:text-6xl text-primary drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
              >
                KICK IN THE DOOR! 🚪🦵
              </motion.p>
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
