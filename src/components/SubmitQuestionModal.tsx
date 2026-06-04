import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Upload, Sparkles, Loader2, Wand2, Lightbulb, Image as ImageIcon, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface SubmitQuestionModalProps {
  category: string;
  onClose: () => void;
}

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

  // Per-option images, aligned to options[]
  const [optionImages, setOptionImages] = useState<(string | null)[]>([null, null, null, null]);
  const [generatingIdx, setGeneratingIdx] = useState<Set<number>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);

  const [autoFillLoading, setAutoFillLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const [refImg, setRefImg] = useState<{ url: string; dataUrl: string; mime: string } | null>(null);

  const refFileRef = useRef<HTMLInputElement>(null);
  const uploadRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

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

  const handleReferenceFile = async (file: File) => {
    if (file.size > 8 * 1024 * 1024) { toast.error('Max 8MB'); return; }
    const dataUrl = await fileToDataUrl(file);
    const url = await uploadToBucket(file);
    setRefImg({ url: url || dataUrl, dataUrl, mime: file.type || 'image/png' });
    toast.success('Reference ready. Try Auto-Fill or Generate All.');
  };

  const handleOptionUpload = async (idx: number, file: File) => {
    if (file.size > 8 * 1024 * 1024) { toast.error('Max 8MB'); return; }
    const url = await uploadToBucket(file);
    if (!url) return;
    setOptionImages(prev => { const n = [...prev]; n[idx] = url; return n; });
  };

  // Generate a single tile (correct or wrong based on idx vs correctAnswer)
  const generateOne = async (idx: number): Promise<string | null> => {
    const opt = options[idx]?.trim();
    if (!opt) { toast.error(`Option ${String.fromCharCode(65 + idx)} is empty`); return null; }
    if (!question.trim()) { toast.error('Add a question first'); return null; }

    const kind: 'correct' | 'wrong' = idx === correctAnswer ? 'correct' : 'wrong';
    const prompt = kind === 'correct' ? (resultTitle || opt) : opt;

    setGeneratingIdx(prev => new Set(prev).add(idx));
    try {
      const { data, error } = await supabase.functions.invoke('generate-answer-image', {
        body: {
          prompt,
          kind,
          category,
          question,
          optionText: opt,
          allOptions: options,
          referenceImageBase64: refImg?.dataUrl,
          referenceMimeType: refImg?.mime,
        },
      });
      if (error) throw error;
      const url = (data as any)?.imageUrl || (data as any)?.url;
      if (!url) {
        toast.error((data as any)?.error || `Failed for option ${String.fromCharCode(65 + idx)}`);
        return null;
      }
      setOptionImages(prev => { const n = [...prev]; n[idx] = url; return n; });
      return url;
    } catch (e: any) {
      toast.error(e.message || 'Generation failed');
      return null;
    } finally {
      setGeneratingIdx(prev => { const n = new Set(prev); n.delete(idx); return n; });
    }
  };

  const handleGenerateAll = async () => {
    if (!question.trim() || options.some(o => !o.trim())) {
      toast.error('Fill in the question and all 4 options first');
      return;
    }
    setBatchLoading(true);
    try {
      const results = await Promise.allSettled([0, 1, 2, 3].map(i => generateOne(i)));
      const ok = results.filter(r => r.status === 'fulfilled' && r.value).length;
      if (ok === 4) toast.success('All 4 answer images generated!');
      else if (ok > 0) toast.message(`${ok}/4 generated — re-run the empty ones`);
      else toast.error('Generation failed — try again');
    } finally {
      setBatchLoading(false);
    }
  };

  const handleAutoFill = async () => {
    if (!refImg) { toast.error('Upload a reference image first'); return; }
    setAutoFillLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-question-image', {
        body: { mode: 'auto_fill', category, imageBase64: refImg.dataUrl, imageMimeType: refImg.mime },
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
      toast.success('Auto-filled! Review then hit Generate All.');
    } catch (e: any) {
      toast.error(e.message || 'Auto-fill failed');
    } finally {
      setAutoFillLoading(false);
    }
  };

  const handleInsights = async () => {
    if (!question.trim() || !options[correctAnswer]?.trim()) {
      toast.error('Add a question and mark the correct answer first');
      return;
    }
    setInsightsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-question-image', {
        body: { mode: 'insights', category, question, correctAnswer: options[correctAnswer], options },
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
      const correctImg = optionImages[correctAnswer];
      const wrongImg = optionImages.find((u, i) => u && i !== correctAnswer) || null;

      const { error } = await supabase.from('question_submissions').insert({
        submitted_by: user.id,
        category,
        question: question.trim(),
        hint: hint.trim(),
        options,
        correct_answer: options[correctAnswer],
        result_title: resultTitle.trim() || 'NICE!',
        result_commentary: [resultCommentary.trim(), insights.trim() && `\n\n💡 ${insights.trim()}`]
          .filter(Boolean).join('') || 'You know your stuff!',
        correct_image_url: correctImg,
        wrong_image_url: wrongImg,
        option_images: optionImages,
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

        {/* AI Reference + Auto-Fill */}
        <div className="mb-5 rounded-xl border border-primary/40 bg-gradient-to-br from-primary/10 to-accent/10 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-accent" />
            <p className="text-sm font-display text-accent">AI ASSIST</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Upload a photo as reference. AI auto-fills the question and generates a unique image for every answer.
          </p>

          {refImg && (
            <div className="relative">
              <img src={refImg.dataUrl} alt="reference" className="w-full h-28 object-cover rounded-md border border-border" />
              <button type="button" onClick={() => setRefImg(null)}
                className="absolute top-1 right-1 bg-background/80 rounded-full p-1" aria-label="Remove reference">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <input ref={refFileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleReferenceFile(e.target.files[0])} />
            <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => refFileRef.current?.click()}>
              <ImageIcon className="h-3 w-3 mr-1" />
              {refImg ? 'Change' : 'Upload Reference'}
            </Button>
            <Button type="button" size="sm" className="flex-1 bg-accent text-accent-foreground hover:opacity-90"
              disabled={!refImg || autoFillLoading} onClick={handleAutoFill}>
              {autoFillLoading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Wand2 className="h-3 w-3 mr-1" />}
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
                  <button type="button" onClick={() => setCorrectAnswer(index)}
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

          {/* Answer image grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Answer Images</label>
              <Button type="button" size="sm" variant="outline"
                className="border-accent/50 text-accent hover:bg-accent/10"
                disabled={batchLoading || generatingIdx.size > 0}
                onClick={handleGenerateAll}>
                {batchLoading
                  ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Generating…</>
                  : <><Sparkles className="h-3 w-3 mr-1" /> Generate All</>}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {options.map((opt, idx) => {
                const url = optionImages[idx];
                const isLoading = generatingIdx.has(idx);
                const isCorrect = idx === correctAnswer;
                return (
                  <div key={idx} className="rounded-md border border-border bg-secondary/40 overflow-hidden">
                    <div className="relative aspect-square bg-background/50 flex items-center justify-center">
                      {url
                        ? <img src={url} alt={`Option ${String.fromCharCode(65 + idx)}`} className="absolute inset-0 w-full h-full object-cover" />
                        : <span className="text-[10px] text-muted-foreground px-2 text-center">No image yet</span>}
                      {isLoading && (
                        <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin text-accent" />
                        </div>
                      )}
                      <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                        isCorrect ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'
                      }`}>
                        {isCorrect ? <CheckCircle2 className="h-2.5 w-2.5" /> : <XCircle className="h-2.5 w-2.5" />}
                        {String.fromCharCode(65 + idx)}
                      </div>
                    </div>
                    <div className="p-1.5 space-y-1">
                      <p className="text-[10px] text-muted-foreground truncate" title={opt}>{opt || `Option ${String.fromCharCode(65 + idx)}`}</p>
                      <div className="flex gap-1">
                        <input ref={uploadRefs[idx]} type="file" accept="image/*" className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleOptionUpload(idx, e.target.files[0])} />
                        <Button type="button" size="sm" variant="ghost"
                          className="flex-1 h-6 px-1 text-[10px]"
                          onClick={() => uploadRefs[idx].current?.click()}>
                          <Upload className="h-2.5 w-2.5 mr-0.5" /> Upload
                        </Button>
                        <Button type="button" size="sm" variant="ghost"
                          className="flex-1 h-6 px-1 text-[10px]"
                          disabled={isLoading} onClick={() => generateOne(idx)}>
                          <RefreshCw className="h-2.5 w-2.5 mr-0.5" /> {url ? 'Re-run' : 'AI'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Each tile uses your reference image + the specific option text. Re-run any tile until you love it.
            </p>
          </div>

          <Button type="button" variant="outline" size="sm" disabled={insightsLoading} onClick={handleInsights}
            className="w-full border-accent/50 text-accent hover:bg-accent/10">
            {insightsLoading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Lightbulb className="h-3 w-3 mr-1" />}
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
              <Textarea value={insights} onChange={(e) => setInsights(e.target.value)}
                className="bg-secondary border-border text-sm" rows={3} />
            </div>
          )}

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
