import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Copy, MessageSquare, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ChallengeModalProps {
  score: number;
  category: string;
  shareCode: string;
  onClose: () => void;
}

export function ChallengeModal({ score, category, shareCode, onClose }: ChallengeModalProps) {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = `${window.location.origin}/challenge/${shareCode}`;
  const shareText = `🧠 I scored ${score} on HOODLINGO ${category.toUpperCase()}! Think you can beat me? 🔥`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleSMS = () => {
    const smsBody = encodeURIComponent(`${shareText}\n${shareUrl}`);
    window.open(`sms:?body=${smsBody}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="quiz-card w-full max-w-sm text-center"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-primary">CHALLENGE A FRIEND</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="text-6xl mb-4">🎯</div>
        
        <p className="text-foreground mb-6">
          Think someone can beat your score of <span className="text-primary font-bold">{score}</span>?
          Send them your exact questions!
        </p>

        <div className="space-y-3">
          <Button
            onClick={handleSMS}
            className="w-full font-display py-6 bg-success text-success-foreground hover:bg-success/90"
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            SEND VIA TEXT
          </Button>

          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="w-full font-display py-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-5 w-5" />
                COPIED!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-5 w-5" />
                COPY SHARE LINK
              </>
            )}
          </Button>
        </div>

        <p className="text-muted-foreground text-xs mt-6">
          They'll play the exact same questions you did!
        </p>
      </motion.div>
    </motion.div>
  );
}
