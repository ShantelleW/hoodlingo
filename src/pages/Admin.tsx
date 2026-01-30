import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ArrowLeft, Check, X, Plus, Crown, Search, Trash2 } from 'lucide-react';

interface Submission {
  id: string;
  question: string;
  hint: string | null;
  options: string[];
  correct_answer: string;
  category: string;
  result_title: string | null;
  result_commentary: string | null;
  status: string;
  votes_for: number;
  votes_against: number;
  created_at: string;
  submitted_by: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  initials: string | null;
  display_name: string | null;
  is_og: boolean;
  has_paid: boolean;
  games_played: number;
}

const CATEGORIES = [
  { id: 'rap', name: 'Rap', emoji: '🎤' },
  { id: 'streets', name: 'These Streets', emoji: '🗽' },
  { id: 'flicks', name: 'Hood Flicks', emoji: '🎬' },
  { id: 'stores', name: 'Corner Stores', emoji: '🏪' },
];

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // New question form
  const [newQuestion, setNewQuestion] = useState({
    category: 'rap',
    question: '',
    hint: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    resultTitle: '',
    resultCommentary: '',
    resultImageUrl: '',
  });

  // Check admin status
  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (error) {
        console.error('Error checking admin:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data);
      }
      setLoading(false);
    }

    checkAdmin();
  }, [user]);

  // Fetch submissions
  useEffect(() => {
    if (!isAdmin) return;

    async function fetchSubmissions() {
      const { data, error } = await supabase
        .from('question_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        setSubmissions(data.map(s => ({
          ...s,
          options: Array.isArray(s.options) 
            ? (s.options as unknown as string[]) 
            : Object.values(s.options as Record<string, string>)
        })) as Submission[]);
      }
    }

    fetchSubmissions();
  }, [isAdmin]);

  // Search users
  const handleUserSearch = async () => {
    if (!userSearch.trim()) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`initials.ilike.%${userSearch}%,display_name.ilike.%${userSearch}%`)
      .limit(20);

    if (data && !error) {
      setUsers(data);
    }
  };

  // Approve submission
  const handleApprove = async (submission: Submission) => {
    try {
      // Add to questions table
      await supabase.from('questions').insert({
        category: submission.category,
        question: submission.question,
        hint: submission.hint,
        options: submission.options,
        correct_answer: submission.correct_answer,
        result_title: submission.result_title,
        result_commentary: submission.result_commentary,
        is_approved: true,
        submitted_by: submission.submitted_by,
        votes_for: submission.votes_for,
        votes_against: submission.votes_against,
      });

      // Update submission status
      await supabase
        .from('question_submissions')
        .update({ status: 'approved' })
        .eq('id', submission.id);

      setSubmissions(prev => prev.filter(s => s.id !== submission.id));
      toast.success('Question approved and added to game!');
    } catch (error) {
      console.error('Error approving:', error);
      toast.error('Failed to approve question');
    }
  };

  // Reject submission
  const handleReject = async (id: string) => {
    await supabase
      .from('question_submissions')
      .update({ status: 'rejected' })
      .eq('id', id);

    setSubmissions(prev => prev.filter(s => s.id !== id));
    toast.success('Question rejected');
  };

  // Toggle OG status
  const handleToggleOG = async (userId: string, currentStatus: boolean) => {
    await supabase
      .from('profiles')
      .update({ is_og: !currentStatus })
      .eq('user_id', userId);

    setUsers(prev => prev.map(u => 
      u.user_id === userId ? { ...u, is_og: !currentStatus } : u
    ));
    toast.success(`OG status ${!currentStatus ? 'granted' : 'revoked'}`);
  };

  // Add new question directly
  const handleAddQuestion = async () => {
    if (!newQuestion.question || newQuestion.options.some(o => !o)) {
      toast.error('Fill in all fields');
      return;
    }

    try {
      await supabase.from('questions').insert({
        category: newQuestion.category,
        question: newQuestion.question,
        hint: newQuestion.hint || null,
        options: newQuestion.options,
        correct_answer: newQuestion.options[newQuestion.correctIndex],
        result_title: newQuestion.resultTitle || 'NICE!',
        result_commentary: newQuestion.resultCommentary || 'You know your stuff!',
        result_image_url: newQuestion.resultImageUrl || null,
        is_approved: true,
      });

      toast.success('Question added to game!');
      setNewQuestion({
        category: 'rap',
        question: '',
        hint: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        resultTitle: '',
        resultCommentary: '',
        resultImageUrl: '',
      });
    } catch (error) {
      console.error('Error adding question:', error);
      toast.error('Failed to add question');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-5xl animate-bounce">🧠</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="font-heading text-3xl text-destructive mb-2">ACCESS DENIED</h1>
        <p className="text-muted-foreground mb-6">You need admin privileges to access this page.</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-heading text-2xl text-primary">ADMIN DASHBOARD</h1>
          <Badge variant="outline" className="ml-auto">
            {pendingSubmissions.length} pending
          </Badge>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <Tabs defaultValue="review" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="review" className="font-display">📝 REVIEW</TabsTrigger>
            <TabsTrigger value="add" className="font-display">➕ ADD Q</TabsTrigger>
            <TabsTrigger value="users" className="font-display">👑 OGs</TabsTrigger>
          </TabsList>

          {/* Review Submissions Tab */}
          <TabsContent value="review" className="space-y-4">
            {pendingSubmissions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-4xl mb-2">✨</div>
                <p>No pending submissions</p>
              </div>
            ) : (
              pendingSubmissions.map((sub, i) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-xl p-4 border border-border"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={`bg-${sub.category}`}>{sub.category.toUpperCase()}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="font-display text-lg mb-2">{sub.question}</p>
                  {sub.hint && (
                    <p className="text-sm text-muted-foreground mb-3">💡 {sub.hint}</p>
                  )}

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {sub.options.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg text-sm ${
                          opt === sub.correct_answer
                            ? 'bg-success/20 border border-success text-success'
                            : 'bg-secondary'
                        }`}
                      >
                        {opt} {opt === sub.correct_answer && '✓'}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                    <span>👍 {sub.votes_for}</span>
                    <span>👎 {sub.votes_against}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(sub)}
                      className="flex-1 bg-success hover:bg-success/90"
                    >
                      <Check className="w-4 h-4 mr-2" /> Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(sub.id)}
                      variant="destructive"
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" /> Reject
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </TabsContent>

          {/* Add Question Tab */}
          <TabsContent value="add" className="space-y-4">
            <div className="bg-card rounded-xl p-4 border border-border space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Category</label>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map(cat => (
                    <Button
                      key={cat.id}
                      variant={newQuestion.category === cat.id ? 'default' : 'outline'}
                      onClick={() => setNewQuestion(prev => ({ ...prev, category: cat.id }))}
                      className="font-display"
                    >
                      {cat.emoji} {cat.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Question</label>
                <Textarea
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="What year did..."
                  className="bg-secondary"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Hint (optional)</label>
                <Input
                  value={newQuestion.hint}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, hint: e.target.value }))}
                  placeholder="Think about..."
                  className="bg-secondary"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Options (tap correct answer)</label>
                <div className="grid grid-cols-2 gap-2">
                  {newQuestion.options.map((opt, idx) => (
                    <div key={idx} className="relative">
                      <Input
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...newQuestion.options];
                          newOpts[idx] = e.target.value;
                          setNewQuestion(prev => ({ ...prev, options: newOpts }));
                        }}
                        placeholder={`Option ${idx + 1}`}
                        className={`bg-secondary pr-10 ${
                          newQuestion.correctIndex === idx ? 'border-success' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setNewQuestion(prev => ({ ...prev, correctIndex: idx }))}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center ${
                          newQuestion.correctIndex === idx 
                            ? 'bg-success text-success-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        {newQuestion.correctIndex === idx && <Check className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Result Title</label>
                  <Input
                    value={newQuestion.resultTitle}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, resultTitle: e.target.value }))}
                    placeholder="CERTIFIED!"
                    className="bg-secondary"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Result Image URL</label>
                  <Input
                    value={newQuestion.resultImageUrl}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, resultImageUrl: e.target.value }))}
                    placeholder="https://..."
                    className="bg-secondary"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Result Commentary</label>
                <Textarea
                  value={newQuestion.resultCommentary}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, resultCommentary: e.target.value }))}
                  placeholder="You really know your hip-hop history!"
                  className="bg-secondary"
                />
              </div>

              <Button onClick={handleAddQuestion} className="w-full font-display text-lg py-6">
                <Plus className="w-5 h-5 mr-2" /> ADD TO GAME
              </Button>
            </div>
          </TabsContent>

          {/* OG Management Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by initials or name..."
                className="bg-secondary"
                onKeyDown={(e) => e.key === 'Enter' && handleUserSearch()}
              />
              <Button onClick={handleUserSearch}>
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {users.length > 0 ? (
              <div className="space-y-2">
                {users.map(u => (
                  <div
                    key={u.id}
                    className="bg-card rounded-xl p-4 border border-border flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-lg">{u.initials || '???'}</span>
                        {u.is_og && <Crown className="w-4 h-4 text-primary" />}
                        {u.has_paid && <Badge variant="outline" className="text-xs">PAID</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {u.games_played || 0} games played
                      </p>
                    </div>
                    <Button
                      variant={u.is_og ? 'destructive' : 'default'}
                      onClick={() => handleToggleOG(u.user_id, u.is_og)}
                    >
                      {u.is_og ? 'Remove OG' : 'Make OG'}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-4xl mb-2">🔍</div>
                <p>Search for users to manage OG status</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
