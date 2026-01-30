import { motion, AnimatePresence } from 'framer-motion';
import { Question } from '@/data/rapQuestions';

interface QuizCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  wrongAnswers: number;
  onAnswer: (answer: string) => void;
  selectedAnswer: string | null;
  showResult: boolean;
  isCorrect: boolean | null;
}

export function QuizCard({
  question,
  questionNumber,
  totalQuestions,
  wrongAnswers,
  onAnswer,
  selectedAnswer,
  showResult,
  isCorrect
}: QuizCardProps) {
  return (
    <div className="min-h-screen quiz-gradient flex flex-col">
      {/* Header with progress */}
      <header className="relative z-10 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/80 text-sm font-medium">
            {questionNumber} of {totalQuestions}
          </span>
          <div className="flex gap-1">
            {[0, 1].map((i) => (
              <span key={i} className="text-xl">
                {i < wrongAnswers ? '❌' : '💀'}
              </span>
            ))}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            className="h-full bg-white rounded-full"
          />
        </div>
      </header>

      {/* Question Card */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm"
          >
            {/* Purple Question Card */}
            <div className="question-card mb-6">
              {/* Question Image */}
              {question.questionImageUrl && (
                <div className="mb-4 -mt-2">
                  <img 
                    src={question.questionImageUrl} 
                    alt="Question visual"
                    className="w-full h-40 object-cover rounded-xl"
                  />
                </div>
              )}

              {/* Question Text */}
              <h2 className="text-white text-xl font-bold text-center mb-4 leading-relaxed">
                {question.question}
              </h2>

              {/* Hint */}
              <p className="text-white/70 text-sm text-center italic">
                {question.hint}
              </p>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrectAnswer = option === question.correctAnswer;
                
                let buttonClass = 'answer-chip';
                if (showResult) {
                  if (isCorrectAnswer) {
                    buttonClass += ' answer-chip-correct';
                  } else if (isSelected && !isCorrect) {
                    buttonClass += ' answer-chip-wrong';
                  }
                }

                return (
                  <motion.button
                    key={option}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                    onClick={() => !showResult && onAnswer(option)}
                    disabled={showResult}
                    className={buttonClass}
                  >
                    {option}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
