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
    <div className="min-h-screen result-gradient flex flex-col">
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="w-full max-w-sm text-center"
        >
          {/* Result Title */}
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`font-display text-xl mb-2 ${isCorrect ? 'text-white' : 'text-red-300'}`}
          >
            {isCorrect ? question.resultTitle : 'NAH BRUH! 😤'}
          </motion.h2>

          {/* Sub-commentary for correct answers */}
          {isCorrect && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-white/70 text-sm mb-4 italic"
            >
              {question.resultCommentary}
            </motion.p>
          )}

          {/* Album/Result Image */}
          {question.resultImageUrl && isCorrect && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative mb-6"
            >
              <div className="w-64 h-64 mx-auto rounded-lg overflow-hidden shadow-2xl ring-4 ring-white/20">
                <img 
                  src={question.resultImageUrl} 
                  alt={question.correctAnswer}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          )}

          {/* Wrong answer indicator */}
          {!isCorrect && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className="w-32 h-32 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
                <span className="text-6xl">❌</span>
              </div>
            </motion.div>
          )}

          {/* Correct Answer - only show if no image was shown */}
          {(!question.resultImageUrl || !isCorrect) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-4"
            >
              <p className="text-white/60 text-sm mb-1">The answer was:</p>
              <p className="text-primary font-bold text-2xl">{question.correctAnswer}</p>
            </motion.div>
          )}

          {/* Show just the answer below image if image was shown */}
          {question.resultImageUrl && isCorrect && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-4"
            >
              <p className="text-primary font-bold text-lg">{question.correctAnswer}</p>
            </motion.div>
          )}

          {/* Commentary for wrong answers */}
          {!isCorrect && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/80 text-sm mb-8 px-4 leading-relaxed"
            >
              The correct answer was {question.correctAnswer}. Next time you'll know!
            </motion.p>
          )}

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={onContinue}
              className="w-full font-display text-lg py-6 bg-white text-primary-foreground hover:bg-white/90 rounded-full shadow-lg"
            >
              {isGameOver ? 'SEE RESULTS' : 'NEXT QUESTION →'}
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
