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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Enhanced gradient background using CSS custom class */}
      <div className="absolute inset-0 result-gradient-enhanced" />
      
      {/* Subtle glow effects */}
      {isCorrect && (
        <>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-primary/5 to-transparent" />
        </>
      )}
      
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="w-full max-w-md text-center"
        >
          {/* Result Title */}
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`font-display text-xl md:text-2xl mb-3 px-4 ${isCorrect ? 'text-white' : 'text-red-300'}`}
          >
            {isCorrect ? question.resultTitle : 'NAH BRUH! 😤'}
          </motion.h2>

          {/* Sub-commentary for correct answers */}
          {isCorrect && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-white/70 text-sm md:text-base mb-5 italic px-6"
            >
              {question.resultCommentary}
            </motion.p>
          )}

          {/* Album/Result Image - BIGGER CARD */}
          {question.resultImageUrl && isCorrect && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', damping: 12 }}
              className="relative mb-6 px-4"
            >
              {/* Card container with gradient border */}
              <div className="relative mx-auto max-w-xs">
                {/* Gradient border effect using primary color */}
                <div className="absolute -inset-1 bg-gradient-to-br from-primary via-accent to-primary rounded-2xl blur-sm opacity-75" />
                
                {/* Main card */}
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl bg-black/50 ring-2 ring-white/10">
                  <img 
                    src={question.resultImageUrl} 
                    alt={question.correctAnswer}
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </div>
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
              <div className="w-36 h-36 mx-auto rounded-full bg-destructive/20 flex items-center justify-center ring-4 ring-destructive/30">
                <span className="text-7xl">❌</span>
              </div>
            </motion.div>
          )}

          {/* Correct Answer - only show if no image was shown */}
          {(!question.resultImageUrl || !isCorrect) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-5"
            >
              <p className="text-white/60 text-sm mb-1">The answer was:</p>
              <p className="text-primary font-bold text-2xl md:text-3xl">{question.correctAnswer}</p>
            </motion.div>
          )}

          {/* Show just the answer below image if image was shown */}
          {question.resultImageUrl && isCorrect && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mb-5"
            >
              <p className="text-primary font-bold text-xl md:text-2xl">{question.correctAnswer}</p>
            </motion.div>
          )}

          {/* Commentary for wrong answers */}
          {!isCorrect && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/80 text-sm md:text-base mb-8 px-6 leading-relaxed"
            >
              The correct answer was <span className="text-primary font-semibold">{question.correctAnswer}</span>. Next time you'll know!
            </motion.p>
          )}

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="px-4"
          >
            <Button
              onClick={onContinue}
              className="w-full font-display text-lg py-6 bg-white text-primary-foreground hover:bg-white/90 rounded-full shadow-lg shadow-white/20"
            >
              {isGameOver ? 'SEE RESULTS' : 'NEXT QUESTION →'}
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
