import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Check, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const updatePaymentStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError('Please log in to complete your purchase');
          setUpdating(false);
          return;
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ has_paid: true })
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error updating payment status:', updateError);
          setError('Failed to update your account. Please contact support.');
        } else {
          setSuccess(true);
        }
      } catch (err) {
        console.error('Payment status update error:', err);
        setError('Something went wrong. Please contact support.');
      } finally {
        setUpdating(false);
      }
    };

    updatePaymentStatus();
  }, []);

  // Auto-redirect countdown after successful payment
  useEffect(() => {
    if (!success) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [success, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 max-w-md w-full"
      >
        <div className="bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 p-1 rounded-3xl">
          <div className="bg-card rounded-3xl p-8 text-center">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative mx-auto w-24 h-24 mb-6"
            >
              <div className="absolute inset-0 bg-success/20 rounded-full animate-ping" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-success to-success/80 rounded-full flex items-center justify-center">
                <Check className="w-12 h-12 text-success-foreground" strokeWidth={3} />
              </div>
            </motion.div>

            {/* Crown animation */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center gap-2 mb-4"
            >
              <Sparkles className="w-6 h-6 text-primary" />
              <Crown className="w-8 h-8 text-primary" />
              <Sparkles className="w-6 h-6 text-primary" />
            </motion.div>

            {/* Text content */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="font-display text-3xl text-foreground mb-2">
                YOU'RE IN! 🔥
              </h1>
              <p className="text-muted-foreground text-lg mb-2">
                Welcome to the unlimited squad
              </p>
              <p className="text-sm text-muted-foreground/70 mb-8">
                No more limits. Play as much as you want, forever.
              </p>
            </motion.div>

            {updating ? (
              <div className="text-muted-foreground">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"
                />
                <p className="mt-2 text-sm">Activating your account...</p>
              </div>
            ) : error ? (
              <div className="text-destructive text-sm mb-4">{error}</div>
            ) : success ? (
              <div className="text-muted-foreground text-sm mb-4">
                Redirecting in <span className="text-primary font-bold">{countdown}</span>...
              </div>
            ) : null}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={() => navigate('/')}
                className="w-full h-14 text-lg font-display bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                disabled={updating}
              >
                {success ? `LET'S GO! (${countdown})` : 'LET\'S GO! 🎤'}
              </Button>
            </motion.div>

            {/* Confetti-like decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: i % 3 === 0 ? 'hsl(var(--primary))' : i % 3 === 1 ? 'hsl(var(--accent))' : 'hsl(var(--success))',
                    left: `${10 + (i * 7)}%`,
                    top: '-10%',
                  }}
                  animate={{
                    y: ['0vh', '120vh'],
                    rotate: [0, 360],
                    opacity: [1, 0],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: 0.5 + (i * 0.1),
                    ease: "easeIn",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
