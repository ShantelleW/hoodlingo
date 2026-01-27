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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Blurred urban background */}
      <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800')] bg-cover bg-center blur-sm opacity-40" />
      <div className="fixed inset-0 urban-gradient" />

      {/* Header with progress */}
      <header className="relative z-10 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-muted-foreground text-sm font-medium">
            Question {questionNumber}/{totalQuestions}
          </span>
          <div className="flex gap-1">
            {[0, 1].map((i) => (
              <span
                key={i}
                className={`text-xl ${i < wrongAnswers ? '❌' : '💀'}`}
              >
                {i < wrongAnswers ? '❌' : '💀'}
              </span>
            ))}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            className="h-full bg-primary rounded-full"
          />
        </div>
      </header>

      {/* Question Card */}
      <main className="relative z-10 flex-1 flex flex-col p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="quiz-card flex-1 flex flex-col"
          >
            {/* Category badge */}
            <div className="flex justify-center mb-4">
              <span className="px-4 py-1 bg-primary/20 text-primary rounded-full text-sm font-bold uppercase">
                {question.category}
              </span>
            </div>

            {/* Question */}
            <h2 className="text-xl font-bold text-foreground text-center mb-4">
              {question.question}
            </h2>

            {/* Hint */}
            <p className="text-muted-foreground text-sm text-center italic mb-6">
              💡 {question.hint}
            </p>

            {/* Answer Options */}
            <div className="flex-1 flex flex-col justify-center gap-3">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrectAnswer = option === question.correctAnswer;
                
                let buttonClass = 'answer-option';
                if (showResult) {
                  if (isCorrectAnswer) {
                    buttonClass += ' answer-option-correct';
                  } else if (isSelected && !isCorrect) {
                    buttonClass += ' answer-option-wrong animate-shake';
                  }
                }

                return (
                  <motion.button
                    key={option}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => !showResult && onAnswer(option)}
                    disabled={showResult}
                    className={buttonClass}
                  >
                    <span className="font-bold mr-3 text-primary">
                      {String.fromCharCode(65 + index)}.
                    </span>
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
