import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Upload, Sparkles, Loader2, Wand2, Lightbulb, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface SubmitQuestionModalProps {
  category: string;
  onClose: () => void;
}

type Kind = 'correct' | 'wrong';

// Convert a File to a base64 data URL
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function SubmitQuestionModal({ category: initialCategory, onClose }: SubmitQuestionModalProps) {
  const { user, updateProfile, profile } = useAuth();
  const [category, setCategory] = useState(initialCategory);
  const [question, setQuestion] = useState('');
  const [hint, setHint] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [resultTitle, setResultTitle] = useState('');
  const [resultCommentary, setResultCommentary] = useState('');
  const [insights, setInsights] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [correctImg, setCorrectImg] = useState<string | null>(null);
  const [wrongImg, setWrongImg] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<Kind | null>(null);
  const [autoFillLoading, setAutoFillLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Reference image (used to inform AI generation & auto-fill)
  const [refImg, setRefImg] = useState<{ url: string; dataUrl: string; mime: string } | null>(null);

  const correctFileRef = useRef<HTMLInputElement>(null);
  const wrongFileRef = useRef<HTMLInputElement>(null);
  const refFileRef = useRef<HTMLInputElement>(null);

  const fireConfetti = () => {
    const end = Date.now() + 1500;
    const colors = ['#a855f7', '#facc15', '#22d3ee', '#f472b6'];
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 70, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  const uploadToBucket = async (file: File): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split('.').pop() || 'png';
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('submission-images').upload(path, file);
    if (error) { toast.error(error.message); return null; }
    const { data } = supabase.storage.from('submission-images').getPublicUrl(path);
    return data.publicUrl;
  };

  // Upload an arbitrary image (correct/wrong answer slot)
  const handleFile = async (file: File, kind: Kind) => {
    if (file.size > 8 * 1024 * 1024) { toast.error('Max 8MB'); return; }
    const url = await uploadToBucket(file);
    if (!url) return;
    if (kind === 'correct') setCorrectImg(url); else setWrongImg(url);
    toast.success('Image uploaded');
  };

  // Upload reference image — also kept as base64 for vision calls
  const handleReferenceFile = async (file: File) => {
    if (file.size > 8 * 1024 * 1024) { toast.error('Max 8MB'); return; }
    const dataUrl = await fileToDataUrl(file);
    const url = await uploadToBucket(file);
    setRefImg({
      url: url || dataUrl,
      dataUrl,
      mime: file.type || 'image/png',
    });
    toast.success('Reference image ready — try Auto-Fill or Generate.');
  };

  // Generate AI image (correct/wrong), optionally using reference image
  const handleAIGen = async (kind: Kind) => {
    const prompt = kind === 'correct'
      ? (resultTitle || options[correctAnswer] || question)
      : (question || 'wrong answer reaction');
    if (!prompt) { toast.error('Add question or answer text first'); return; }

    setAiLoading(kind);
    try {
      const { data, error } = await supabase.functions.invoke('generate-answer-image', {
        body: {
          prompt,
          kind,
          category,
          referenceImageBase64: refImg?.dataUrl,
          referenceMimeType: refImg?.mime,
        },
      });
      if (error) throw error;
      const url = (data as any)?.imageUrl || (data as any)?.url;
      if (url) {
        if (kind === 'correct') setCorrectImg(url); else setWrongImg(url);
        toast.success('AI image generated' + (refImg ? ' from your reference' : ''));
      } else {
        toast.error((data as any)?.error || 'Failed');
      }
    } catch (e: any) {
      toast.error(e.message || 'AI generation failed');
    } finally {
      setAiLoading(null);
    }
  };

  // Auto-fill all fields from the reference image using vision AI
  const handleAutoFill = async () => {
    if (!refImg) {
      toast.error('Upload a reference image first');
      return;
    }
    setAutoFillLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-question-image', {
        body: {
          mode: 'auto_fill',
          category,
          imageBase64: refImg.dataUrl,
          imageMimeType: refImg.mime,
        },
      });
      if (error) throw error;
      const d = data as any;
      if (d?.error) { toast.error(d.error); return; }
      if (d?.category) setCategory(d.category);
      if (d?.question) setQuestion(d.question);
      if (d?.hint) setHint(d.hint);
      if (Array.isArray(d?.options) && d.options.length === 4) setOptions(d.options);
      if (typeof d?.correctAnswerIndex === 'number') setCorrectAnswer(d.correctAnswerIndex);
      if (d?.resultTitle) setResultTitle(d.resultTitle);
      if (d?.resultCommentary) setResultCommentary(d.resultCommentary);
      if (d?.insights) setInsights(d.insights);
      toast.success('Auto-filled from image! Review and tweak.');
    } catch (e: any) {
      toast.error(e.message || 'Auto-fill failed');
    } finally {
      setAutoFillLoading(false);
    }
  };

  // Generate insights/commentary from current question + answer
  const handleInsights = async () => {
    if (!question.trim() || !options[correctAnswer]?.trim()) {
      toast.error('Add a question and mark the correct answer first');
      return;
    }
    setInsightsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-question-image', {
        body: {
          mode: 'insights',
          category,
          question,
          correctAnswer: options[correctAnswer],
          options,
        },
      });
      if (error) throw error;
      const d = data as any;
      if (d?.error) { toast.error(d.error); return; }
      if (d?.resultTitle) setResultTitle(d.resultTitle);
      if (d?.resultCommentary) setResultCommentary(d.resultCommentary);
      if (d?.insights) setInsights(d.insights);
      toast.success('Insights generated!');
    } catch (e: any) {
      toast.error(e.message || 'Insights failed');
    } finally {
      setInsightsLoading(false);
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
      const { error } = await supabase.from('question_submissions').insert({
        submitted_by: user.id,
        category,
        question: question.trim(),
        hint: hint.trim(),
        options: options,
        correct_answer: options[correctAnswer],
        result_title: resultTitle.trim() || 'NICE!',
        result_commentary: [resultCommentary.trim(), insights.trim() && `\n\n💡 ${insights.trim()}`]
          .filter(Boolean)
          .join('') || 'You know your stuff!',
        correct_image_url: correctImg,
        wrong_image_url: wrongImg,
      });

      if (error) throw error;

      fireConfetti();

      if (!profile?.is_og) {
        await updateProfile({ is_og: true } as any);
        toast.success("🎉 You're now an OG!");
      } else {
        toast.success('Question submitted!');
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
        {kind === 'correct' ? '✅ Right Answer Image' : '❌ Wrong Answer Image'}
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
          title={refImg ? 'Generate using your reference image' : 'Generate from question/answer text'}
        >
          {aiLoading === kind
            ? <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            : <Sparkles className="h-3 w-3 mr-1" />}
          {refImg ? 'AI Remix' : 'AI Generate'}
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl text-primary">SUBMIT A QUESTION</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>

        {/* Category pill */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Category:</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-secondary text-primary text-xs font-display uppercase px-2 py-1 rounded border border-border"
          >
            <option value="rap">Rap</option>
            <option value="streets">In These Streets</option>
            <option value="flicks">Hood Flicks</option>
            <option value="stores">Corner Stores</option>
          </select>
        </div>

        {/* AI Reference Image + Auto-Fill */}
        <div className="mb-5 rounded-xl border border-primary/40 bg-gradient-to-br from-primary/10 to-accent/10 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-accent" />
            <p className="text-sm font-display text-accent">AI ASSIST</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Upload a photo as reference. AI can auto-fill the whole question and remix it into hype answer images.
          </p>

          {refImg && (
            <div className="relative">
              <img src={refImg.dataUrl} alt="reference" className="w-full h-28 object-cover rounded-md border border-border" />
              <button
                type="button"
                onClick={() => setRefImg(null)}
                className="absolute top-1 right-1 bg-background/80 rounded-full p-1"
                aria-label="Remove reference"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <input
              ref={refFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleReferenceFile(e.target.files[0])}
            />
            <Button
              type="button" variant="outline" size="sm" className="flex-1"
              onClick={() => refFileRef.current?.click()}
            >
              <ImageIcon className="h-3 w-3 mr-1" />
              {refImg ? 'Change' : 'Upload Reference'}
            </Button>
            <Button
              type="button" size="sm" className="flex-1 bg-accent text-accent-foreground hover:opacity-90"
              disabled={!refImg || autoFillLoading}
              onClick={handleAutoFill}
            >
              {autoFillLoading
                ? <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                : <Wand2 className="h-3 w-3 mr-1" />}
              Auto-Fill
            </Button>
          </div>
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

          {/* AI Insights button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={insightsLoading}
            onClick={handleInsights}
            className="w-full border-accent/50 text-accent hover:bg-accent/10"
          >
            {insightsLoading
              ? <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              : <Lightbulb className="h-3 w-3 mr-1" />}
            Generate Result Title + Commentary + Insights
          </Button>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Result Title</label>
            <Input value={resultTitle} onChange={(e) => setResultTitle(e.target.value)} placeholder='e.g. "JAY-Z! DUH!"' className="bg-secondary border-border" />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Result Commentary</label>
            <Textarea value={resultCommentary} onChange={(e) => setResultCommentary(e.target.value)} placeholder="Fun fact about the answer..." className="bg-secondary border-border" />
          </div>

          {insights && (
            <div>
              <label className="text-sm text-muted-foreground mb-1 block flex items-center gap-1">
                <Lightbulb className="h-3 w-3 text-accent" /> Cultural Insights (for OG reviewers)
              </label>
              <Textarea
                value={insights}
                onChange={(e) => setInsights(e.target.value)}
                className="bg-secondary border-border text-sm"
                rows={3}
              />
            </div>
          )}

          <ImageSlot kind="correct" url={correctImg} fileRef={correctFileRef} />
          <ImageSlot kind="wrong" url={wrongImg} fileRef={wrongFileRef} />

          <Button type="submit" disabled={isSubmitting} className="w-full font-display text-lg py-6 bg-primary text-primary-foreground">
            {isSubmitting ? 'SUBMITTING...' : 'SUBMIT QUESTION'}
          </Button>
        </form>

        <p className="text-muted-foreground text-xs text-center mt-4">
          Submit questions to become an OG.
        </p>
      </motion.div>
    </motion.div>
  );
}
