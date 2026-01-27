import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Question } from '@/data/rapQuestions';

interface ResultScreenProps {
  question: Question;
  isCorrect: boolean;
  onContinue: () => void;
  isGameOver: boolean;
}

export function ResultScreen({ question, isCorrect, onContinue, isGameOver }: ResultScreenProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800')] bg-cover bg-center opacity-30" />
      <div className="fixed inset-0 urban-gradient" />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="quiz-card w-full max-w-sm text-center"
        >
          {/* Result Emoji */}
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-7xl mb-4"
          >
            {isCorrect ? '🔥' : '😤'}
          </motion.div>

          {/* Result Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`font-display text-3xl mb-4 ${isCorrect ? 'text-success' : 'text-destructive'}`}
          >
            {isCorrect ? question.resultTitle : 'NAH BRUH!'}
          </motion.h2>

          {/* Correct Answer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-4"
          >
            <p className="text-muted-foreground text-sm mb-1">The answer was:</p>
            <p className="text-primary font-bold text-xl">{question.correctAnswer}</p>
          </motion.div>

          {/* Commentary */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-foreground text-sm mb-6"
          >
            {isCorrect ? question.resultCommentary : `The correct answer was ${question.correctAnswer}. Next time you'll know!`}
          </motion.p>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              onClick={onContinue}
              className="w-full font-display text-lg py-6 bg-primary text-primary-foreground hover:bg-primary/90 pulse-glow"
            >
              {isGameOver ? 'SEE RESULTS' : 'NEXT QUESTION'}
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
