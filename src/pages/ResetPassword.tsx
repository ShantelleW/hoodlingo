import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if this is a recovery session (user clicked email link)
    const hash = window.location.hash;
    if (hash.includes('type=recovery') || hash.includes('access_token')) {
      setIsRecovery(true);
    } else {
      setError('Invalid or expired reset link. Please request a new one.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await updatePassword(password);
    setLoading(false);

    if (result.error) {
      setError(result.error.message);
    } else {
      toast.success('Password updated successfully!');
      // Give toast time to show
      setTimeout(() => navigate('/'), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🧠</div>
          <h1 className="font-display text-3xl text-primary tracking-wide">
            HOODLINGO
          </h1>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          <h2 className="font-display text-xl text-gray-900 text-center mb-6">
            SET NEW PASSWORD
          </h2>

          {!isRecovery ? (
            <div className="text-center">
              <p className="text-destructive text-sm mb-4">{error}</p>
              <Button
                onClick={() => navigate('/')}
                className="w-full font-display text-lg py-5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
              >
                GO HOME
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-100 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl py-5"
                required
                minLength={6}
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? '...' : 'UPDATE PASSWORD'}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
