import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SubmitQuestionModalProps {
  category: string;
  onClose: () => void;
}

export function SubmitQuestionModal({ category, onClose }: SubmitQuestionModalProps) {
  const { user, updateProfile, profile } = useAuth();
  const [question, setQuestion] = useState('');
  const [hint, setHint] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [resultTitle, setResultTitle] = useState('');
  const [resultCommentary, setResultCommentary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate
    if (!question.trim() || options.some(o => !o.trim())) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('question_submissions').insert({
        submitted_by: user.id,
        category,
        question: question.trim(),
        hint: hint.trim(),
        options: options,
        correct_answer: options[correctAnswer],
        result_title: resultTitle.trim() || 'NICE!',
        result_commentary: resultCommentary.trim() || 'You know your stuff!'
      });

      if (error) throw error;

      // If user isn't an OG yet, invite them
      if (!profile?.is_og) {
        await updateProfile({ is_og: true });
        toast.success('🎉 You\'ve been invited to become an OG! Check your email for voting privileges.');
      } else {
        toast.success('Question submitted! OGs will vote on it.');
      }

      onClose();
    } catch (error) {
      console.error('Error submitting question:', error);
      toast.error('Failed to submit question. Try again.');
    } finally {
      setIsSubmitting(false);
    }
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
        className="quiz-card w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-primary">SUBMIT A QUESTION</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Question</label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What's your question?"
              className="bg-secondary border-border"
              required
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Hint (witty clue)</label>
            <Input
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="Give a fun hint..."
              className="bg-secondary border-border"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Answer Options (select correct one)</label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCorrectAnswer(index)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${
                      correctAnswer === index
                        ? 'bg-success text-success-foreground'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </button>
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="bg-secondary border-border flex-1"
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Result Title (e.g., "JAY-Z! DUH!")</label>
            <Input
              value={resultTitle}
              onChange={(e) => setResultTitle(e.target.value)}
              placeholder="Celebratory title..."
              className="bg-secondary border-border"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Result Commentary</label>
            <Textarea
              value={resultCommentary}
              onChange={(e) => setResultCommentary(e.target.value)}
              placeholder="Fun fact or commentary about the answer..."
              className="bg-secondary border-border"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full font-display text-lg py-6 bg-primary text-primary-foreground"
          >
            {isSubmitting ? 'SUBMITTING...' : 'SUBMIT QUESTION'}
          </Button>
        </form>

        <p className="text-muted-foreground text-xs text-center mt-4">
          Submit questions to become an OG and vote on new content!
        </p>
      </motion.div>
    </motion.div>
  );
}
