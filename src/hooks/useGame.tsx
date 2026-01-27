import { useState, useCallback } from 'react';
import { Question, getRandomQuestions } from '@/data/rapQuestions';

interface GameState {
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  wrongAnswers: number;
  isGameOver: boolean;
  isGameWon: boolean;
  selectedAnswer: string | null;
  showResult: boolean;
  isCorrect: boolean | null;
}

const WRONG_ANSWERS_LIMIT = 2;
const QUESTIONS_PER_GAME = 10;

export function useGame() {
  const [gameState, setGameState] = useState<GameState>({
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    wrongAnswers: 0,
    isGameOver: false,
    isGameWon: false,
    selectedAnswer: null,
    showResult: false,
    isCorrect: null
  });

  const startGame = useCallback((category: string = 'rap') => {
    const questions = getRandomQuestions(QUESTIONS_PER_GAME);
    setGameState({
      questions,
      currentQuestionIndex: 0,
      score: 0,
      wrongAnswers: 0,
      isGameOver: false,
      isGameWon: false,
      selectedAnswer: null,
      showResult: false,
      isCorrect: null
    });
  }, []);

  const getCurrentQuestion = (): Question | null => {
    if (gameState.questions.length === 0) return null;
    return gameState.questions[gameState.currentQuestionIndex];
  };

  const submitAnswer = useCallback((answer: string) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion || gameState.showResult) return;

    const isCorrect = answer === currentQuestion.correctAnswer;
    const newWrongAnswers = isCorrect ? gameState.wrongAnswers : gameState.wrongAnswers + 1;
    const newScore = isCorrect ? gameState.score + 1 : gameState.score;
    
    // Check if game is over
    const isGameOver = newWrongAnswers >= WRONG_ANSWERS_LIMIT;
    const isLastQuestion = gameState.currentQuestionIndex >= gameState.questions.length - 1;
    const isGameWon = isLastQuestion && !isGameOver && isCorrect;

    setGameState(prev => ({
      ...prev,
      selectedAnswer: answer,
      showResult: true,
      isCorrect,
      score: newScore,
      wrongAnswers: newWrongAnswers,
      isGameOver: isGameOver || (isLastQuestion && isCorrect),
      isGameWon: isGameWon
    }));
  }, [gameState]);

  const nextQuestion = useCallback(() => {
    if (gameState.isGameOver) return;

    setGameState(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      selectedAnswer: null,
      showResult: false,
      isCorrect: null
    }));
  }, [gameState.isGameOver]);

  const resetGame = useCallback(() => {
    setGameState({
      questions: [],
      currentQuestionIndex: 0,
      score: 0,
      wrongAnswers: 0,
      isGameOver: false,
      isGameWon: false,
      selectedAnswer: null,
      showResult: false,
      isCorrect: null
    });
  }, []);

  return {
    ...gameState,
    currentQuestion: getCurrentQuestion(),
    startGame,
    submitAnswer,
    nextQuestion,
    resetGame,
    totalQuestions: gameState.questions.length,
    questionsRemaining: gameState.questions.length - gameState.currentQuestionIndex
  };
}
