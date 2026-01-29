import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { useGame } from '@/hooks/useGame';
import { SignupScreen } from '@/components/SignupScreen';
import { HomeScreen } from '@/components/HomeScreen';
import { QuizCard } from '@/components/QuizCard';
import { ResultScreen } from '@/components/ResultScreen';
import { GameOverScreen } from '@/components/GameOverScreen';
import { SideMenu } from '@/components/SideMenu';
import { SubmitQuestionModal } from '@/components/SubmitQuestionModal';
import { ChallengeModal } from '@/components/ChallengeModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Screen = 'signup' | 'home' | 'quiz' | 'result' | 'gameover';

function GameContent() {
  const { user, profile, loading, incrementGamesPlayed } = useAuth();
  const game = useGame();
  
  const [screen, setScreen] = useState<Screen>('signup');
  const [currentCategory, setCurrentCategory] = useState('rap');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSubmitQuestion, setShowSubmitQuestion] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengeShareCode, setChallengeShareCode] = useState('');

  useEffect(() => {
    if (!loading) {
      if (user) {
        setScreen('home');
      } else {
        setScreen('signup');
      }
    }
  }, [user, loading]);

  const handleCategorySelect = async (category: string) => {
    // Check paywall - after 2 free games
    if (profile && !profile.has_paid && (profile.games_played || 0) >= 2) {
      toast.error('🔒 You\'ve used your free games! Unlock unlimited play for $1.');
      window.open('https://buy.stripe.com/cNi8wRfKe03D41g6uPfYY00', '_blank');
      return;
    }

    setCurrentCategory(category);
    game.startGame(category);
    setScreen('quiz');
  };

  const handleAnswer = (answer: string) => {
    game.submitAnswer(answer);
    // Auto-advance to result screen after a brief delay
    setTimeout(() => {
      setScreen('result');
    }, 500);
  };

  const handleContinue = async () => {
    if (game.isGameOver) {
      // Increment games played count
      await incrementGamesPlayed();
      setScreen('gameover');
    } else {
      game.nextQuestion();
      setScreen('quiz');
    }
  };

  const handlePlayAgain = () => {
    // Check paywall again
    if (profile && !profile.has_paid && (profile.games_played || 0) >= 2) {
      toast.error('🔒 You\'ve used your free games! Unlock unlimited play for $1.');
      window.open('https://buy.stripe.com/cNi8wRfKe03D41g6uPfYY00', '_blank');
      return;
    }
    
    game.startGame(currentCategory);
    setScreen('quiz');
  };

  const handleGoHome = () => {
    game.resetGame();
    setScreen('home');
  };

  const handleChallenge = async () => {
    if (!user) return;

    try {
      // Create challenge with current questions
      const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const questionIds = game.questions.map(q => q.id);

      await supabase.from('challenges').insert({
        challenger_id: user.id,
        question_ids: questionIds,
        category: currentCategory,
        challenger_score: game.score,
        share_code: shareCode
      });

      setChallengeShareCode(shareCode);
      setShowChallenge(true);
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast.error('Failed to create challenge');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🧠</div>
          <p className="text-primary font-display">LOADING...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Home screen is always shown when user exists or on signup */}
      {(screen === 'home' || screen === 'signup') && !loading && (
        <HomeScreen
          onCategorySelect={handleCategorySelect}
          onMenuClick={() => setMenuOpen(true)}
        />
      )}

      <AnimatePresence mode="wait">
        {/* Signup overlay on top of home */}
        {screen === 'signup' && (
          <SignupScreen 
            key="signup"
            onComplete={() => setScreen('home')} 
          />
        )}

        {screen === 'quiz' && game.currentQuestion && (
          <QuizCard
            key={`quiz-${game.currentQuestionIndex}`}
            question={game.currentQuestion}
            questionNumber={game.currentQuestionIndex + 1}
            totalQuestions={game.totalQuestions}
            wrongAnswers={game.wrongAnswers}
            onAnswer={handleAnswer}
            selectedAnswer={game.selectedAnswer}
            showResult={game.showResult}
            isCorrect={game.isCorrect}
          />
        )}

        {screen === 'result' && game.currentQuestion && (
          <ResultScreen
            key="result"
            question={game.currentQuestion}
            isCorrect={game.isCorrect ?? false}
            onContinue={handleContinue}
            isGameOver={game.isGameOver}
          />
        )}

        {screen === 'gameover' && (
          <GameOverScreen
            key="gameover"
            score={game.score}
            totalQuestions={game.totalQuestions}
            category={currentCategory}
            onPlayAgain={handlePlayAgain}
            onGoHome={handleGoHome}
            onChallenge={handleChallenge}
            onSubmitQuestion={() => setShowSubmitQuestion(true)}
          />
        )}
      </AnimatePresence>

      {/* Side Menu */}
      <AnimatePresence>
        {menuOpen && (
          <SideMenu
            isOpen={menuOpen}
            onClose={() => setMenuOpen(false)}
            onViewLeaderboard={() => {
              setMenuOpen(false);
              // Could navigate to dedicated leaderboard page
            }}
          />
        )}
      </AnimatePresence>

      {/* Submit Question Modal */}
      <AnimatePresence>
        {showSubmitQuestion && (
          <SubmitQuestionModal
            category={currentCategory}
            onClose={() => setShowSubmitQuestion(false)}
          />
        )}
      </AnimatePresence>

      {/* Challenge Modal */}
      <AnimatePresence>
        {showChallenge && (
          <ChallengeModal
            score={game.score}
            category={currentCategory}
            shareCode={challengeShareCode}
            onClose={() => setShowChallenge(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Index() {
  return (
    <AuthProvider>
      <GameContent />
    </AuthProvider>
  );
}
