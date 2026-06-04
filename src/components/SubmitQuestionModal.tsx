import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Upload, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface SubmitQuestionModalProps {
  category: string;
  onClose: () => void;
}

type Kind = 'correct' | 'wrong';

export function SubmitQuestionModal({ category, onClose }: SubmitQuestionModalProps) {
  const { user, updateProfile, profile } = useAuth();
  const [question, setQuestion] = useState('');
  const [hint, setHint] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [resultTitle, setResultTitle] = useState('');
  const [resultCommentary, setResultCommentary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [correctImg, setCorrectImg] = useState<string | null>(null);
  const [wrongImg, setWrongImg] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<Kind | null>(null);
  const correctFileRef = useRef<HTMLInputElement>(null);
  const wrongFileRef = useRef<HTMLInputElement>(null);

  const fireConfetti = () => {
    const end = Date.now() + 1500;
    const colors = ['#a855f7', '#facc15', '#22d3ee', '#f472b6'];
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 70, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  const handleFile = async (file: File, kind: Kind) => {
    if (!user) return;
    if (file.size > 8 * 1024 * 1024) { toast.error('Max 8MB'); return; }
    const ext = file.name.split('.').pop() || 'png';
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('submission-images').upload(path, file);
    if (error) { toast.error(error.message); return; }
    const { data } = supabase.storage.from('submission-images').getPublicUrl(path);
    if (kind === 'correct') setCorrectImg(data.publicUrl); else setWrongImg(data.publicUrl);
    toast.success('Image uploaded');
  };

  const handleAIGen = async (kind: Kind) => {
    const prompt = kind === 'correct' ? (resultTitle || options[correctAnswer] || question) : (question || 'wrong answer');
    if (!prompt) { toast.error('Add question/answer text first'); return; }
    setAiLoading(kind);
    try {
      const { data, error } = await supabase.functions.invoke('generate-answer-image', { body: { prompt, kind } });
      if (error) throw error;
      if ((data as any)?.url) {
        if (kind === 'correct') setCorrectImg((data as any).url); else setWrongImg((data as any).url);
        toast.success('AI image generated');
      } else {
        toast.error((data as any)?.error || 'Failed');
      }
    } catch (e: any) {
      toast.error(e.message || 'AI generation failed');
    } finally {
      setAiLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!question.trim() || options.some(o => !o.trim())) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: inserted, error } = await supabase.from('question_submissions').insert({
        submitted_by: user.id,
        category,
        question: question.trim(),
        hint: hint.trim(),
        options: options,
        correct_answer: options[correctAnswer],
        result_title: resultTitle.trim() || 'NICE!',
        result_commentary: resultCommentary.trim() || 'You know your stuff!',
        correct_image_url: correctImg,
        wrong_image_url: wrongImg,
      }).select().single();

      if (error) throw error;

      fireConfetti();

      // Fire-and-forget preview email
      supabase.functions.invoke('send-question-preview', {
        body: { submissionId: inserted.id }
      }).catch(err => console.warn('preview email failed', err));

      if (!profile?.is_og) {
        await updateProfile({ is_og: true } as any);
        toast.success("🎉 You're now an OG! Preview sent to your email.");
      } else {
        toast.success('Question submitted! Preview sent to your email.');
      }

      setTimeout(onClose, 1200);
    } catch (error) {
      console.error('Error submitting question:', error);
      toast.error('Failed to submit question. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ImageSlot = ({ kind, url, fileRef }: { kind: Kind; url: string | null; fileRef: React.RefObject<HTMLInputElement> }) => (
    <div className="space-y-2">
      <label className="text-sm text-muted-foreground block">
        {kind === 'correct' ? '✅ Right Answer Image/GIF' : '❌ Wrong Answer Image/GIF'}
      </label>
      {url && <img src={url} alt={kind} className="w-full h-32 object-cover rounded-md border border-border" />}
      <div className="flex gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*,image/gif"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], kind)}
        />
        <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => fileRef.current?.click()}>
          <Upload className="h-3 w-3 mr-1" /> Upload
        </Button>
        <Button
          type="button" variant="outline" size="sm" className="flex-1"
          disabled={aiLoading === kind}
          onClick={() => handleAIGen(kind)}
        >
          {aiLoading === kind ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
          AI Generate
        </Button>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="quiz-card w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-primary">SUBMIT A QUESTION</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Question</label>
            <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What's your question?" className="bg-secondary border-border" required />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Hint (witty clue)</label>
            <Input value={hint} onChange={(e) => setHint(e.target.value)} placeholder="Give a fun hint..." className="bg-secondary border-border" />
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
                      correctAnswer === index ? 'bg-success text-success-foreground' : 'bg-secondary text-muted-foreground'
                    }`}
                  >{String.fromCharCode(65 + index)}</button>
                  <Input value={option} onChange={(e) => { const n = [...options]; n[index] = e.target.value; setOptions(n); }}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`} className="bg-secondary border-border flex-1" required />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Result Title</label>
            <Input value={resultTitle} onChange={(e) => setResultTitle(e.target.value)} placeholder='e.g. "JAY-Z! DUH!"' className="bg-secondary border-border" />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Result Commentary</label>
            <Textarea value={resultCommentary} onChange={(e) => setResultCommentary(e.target.value)} placeholder="Fun fact about the answer..." className="bg-secondary border-border" />
          </div>

          <ImageSlot kind="correct" url={correctImg} fileRef={correctFileRef} />
          <ImageSlot kind="wrong" url={wrongImg} fileRef={wrongFileRef} />

          <Button type="submit" disabled={isSubmitting} className="w-full font-display text-lg py-6 bg-primary text-primary-foreground">
            {isSubmitting ? 'SUBMITTING...' : 'SUBMIT QUESTION'}
          </Button>
        </form>

        <p className="text-muted-foreground text-xs text-center mt-4">
          Submit questions to become an OG. We'll email you a preview.
        </p>
      </motion.div>
    </motion.div>
  );
}
