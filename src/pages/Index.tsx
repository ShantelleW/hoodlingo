import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { ChallengeIntroScreen } from '@/components/ChallengeIntroScreen';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Screen = 'signup' | 'home' | 'quiz' | 'result' | 'gameover' | 'challenge-intro';

interface ChallengeData {
  id: string;
  challenger_id: string;
  question_ids: string[];
  category: string;
  challenger_score: number;
  created_at: string;
  challengerInitials: string | null;
}

function GameContent() {
  const { user, profile, loading, incrementGamesPlayed } = useAuth();
  const game = useGame();
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  const [screen, setScreen] = useState<Screen>('signup');
  const [currentCategory, setCurrentCategory] = useState('rap');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSubmitQuestion, setShowSubmitQuestion] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengeShareCode, setChallengeShareCode] = useState('');
  const [challengeData, setChallengeData] = useState<ChallengeData | null>(null);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(false);

  // Load challenge data if we have a code
  useEffect(() => {
    async function loadChallenge() {
      if (!code) return;
      
      setIsLoadingChallenge(true);
      try {
        // Fetch challenge with challenger profile
        const { data: challenge, error } = await supabase
          .from('challenges')
          .select('*')
          .eq('share_code', code)
          .single();

        if (error || !challenge) {
          toast.error('Challenge not found');
          navigate('/');
          return;
        }

        // Fetch challenger's profile for initials
        const { data: challengerProfile } = await supabase
          .from('profiles')
          .select('initials')
          .eq('user_id', challenge.challenger_id)
          .single();

        setChallengeData({
          ...challenge,
          challengerInitials: challengerProfile?.initials || null
        });
      } catch (err) {
        console.error('Error loading challenge:', err);
        toast.error('Failed to load challenge');
        navigate('/');
      } finally {
        setIsLoadingChallenge(false);
      }
    }

    loadChallenge();
  }, [code, navigate]);

  useEffect(() => {
    if (!loading) {
      if (challengeData && user) {
        // Show challenge intro if we have challenge data
        setScreen('challenge-intro');
      } else if (user) {
        setScreen('home');
      } else {
        setScreen('signup');
      }
    }
  }, [user, loading, challengeData]);

  const handleAcceptChallenge = () => {
    if (!challengeData) return;
    
    setCurrentCategory(challengeData.category);
    game.startChallengeGame(challengeData.question_ids);
    setScreen('quiz');
  };

  const handleDeclineChallenge = () => {
    setChallengeData(null);
    navigate('/');
    setScreen('home');
  };

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
      
      // If this was a challenge, save the response
      if (challengeData && user) {
        try {
          await supabase.from('challenge_responses').insert({
            challenge_id: challengeData.id,
            responder_id: user.id,
            score: game.score
          });
        } catch (err) {
          console.error('Error saving challenge response:', err);
        }
      }
      
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
    
    // Clear challenge data when playing again normally
    setChallengeData(null);
    game.startGame(currentCategory);
    setScreen('quiz');
  };

  const handleGoHome = () => {
    game.resetGame();
    setChallengeData(null);
    navigate('/');
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

  if (loading || isLoadingChallenge) {
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
            onComplete={() => {
              if (challengeData) {
                setScreen('challenge-intro');
              } else {
                setScreen('home');
              }
            }} 
          />
        )}

        {/* Challenge Intro Screen */}
        {screen === 'challenge-intro' && challengeData && (
          <ChallengeIntroScreen
            key="challenge-intro"
            challengerInitials={challengeData.challengerInitials}
            challengerScore={challengeData.challenger_score}
            challengedAt={challengeData.created_at}
            category={challengeData.category}
            onAccept={handleAcceptChallenge}
            onDecline={handleDeclineChallenge}
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
            challengeData={challengeData ? {
              challengerInitials: challengeData.challengerInitials,
              challengerScore: challengeData.challenger_score
            } : undefined}
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
