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
import { ArrowLeft, Check, X, Plus, Crown, Search, Trash2, Upload, FileJson, FileSpreadsheet } from 'lucide-react';

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

interface Category {
  id: string;
  name: string;
  emoji: string;
  description: string | null;
  is_active: boolean;
  question_count: number;
}

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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

  // New category form
  const [newCategory, setNewCategory] = useState({
    id: '',
    name: '',
    emoji: '📚',
    description: '',
  });

  // Bulk import state
  const [importedQuestions, setImportedQuestions] = useState<Array<{
    category: string;
    question: string;
    hint: string;
    options: string[];
    correct_answer: string;
    result_title: string;
    result_commentary: string;
    result_image_url: string;
  }>>([]);
  const [isImporting, setIsImporting] = useState(false);

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

  // Fetch submissions and categories
  useEffect(() => {
    if (!isAdmin) return;

    async function fetchData() {
      // Fetch submissions
      const { data: submissionsData } = await supabase
        .from('question_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (submissionsData) {
        setSubmissions(submissionsData.map(s => ({
          ...s,
          options: Array.isArray(s.options) 
            ? (s.options as unknown as string[]) 
            : Object.values(s.options as Record<string, string>)
        })) as Submission[]);
      }

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesData) {
        setCategories(categoriesData as Category[]);
      }
    }

    fetchData();
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
          <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="review" className="font-display">📝 REVIEW</TabsTrigger>
            <TabsTrigger value="add" className="font-display">➕ ADD Q</TabsTrigger>
            <TabsTrigger value="import" className="font-display">📥 IMPORT</TabsTrigger>
            <TabsTrigger value="categories" className="font-display">📂 CATS</TabsTrigger>
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
                  {categories.filter(c => c.is_active).map(cat => (
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

          {/* Bulk Import Tab */}
          <TabsContent value="import" className="space-y-4">
            <div className="bg-card rounded-xl p-4 border border-border space-y-4">
              <h3 className="font-display text-lg text-primary">BULK QUESTION IMPORT</h3>
              <p className="text-sm text-muted-foreground">
                Upload a CSV or JSON file with questions. Required fields: category, question, options (array), correct_answer.
                Optional: hint, result_title, result_commentary, result_image_url.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted rounded-xl cursor-pointer hover:border-primary transition-colors">
                  <FileSpreadsheet className="w-8 h-8 mb-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Upload CSV</span>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const text = event.target?.result as string;
                        const lines = text.split('\n').filter(line => line.trim());
                        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
                        
                        const questions = lines.slice(1).map(line => {
                          // Parse CSV with quoted values
                          const values: string[] = [];
                          let current = '';
                          let inQuotes = false;
                          
                          for (let i = 0; i < line.length; i++) {
                            const char = line[i];
                            if (char === '"') {
                              inQuotes = !inQuotes;
                            } else if (char === ',' && !inQuotes) {
                              values.push(current.trim());
                              current = '';
                            } else {
                              current += char;
                            }
                          }
                          values.push(current.trim());
                          
                          const obj: Record<string, string> = {};
                          headers.forEach((h, i) => {
                            obj[h] = values[i] || '';
                          });
                          
                          // Parse options - expect format: "option1|option2|option3|option4"
                          const optionsStr = obj.options || '';
                          const options = optionsStr.includes('|') 
                            ? optionsStr.split('|').map(o => o.trim())
                            : optionsStr.includes(';')
                              ? optionsStr.split(';').map(o => o.trim())
                              : [optionsStr];
                          
                          return {
                            category: obj.category || 'rap',
                            question: obj.question || '',
                            hint: obj.hint || '',
                            options: options.length >= 4 ? options.slice(0, 4) : [...options, '', '', '', ''].slice(0, 4),
                            correct_answer: obj.correct_answer || options[0] || '',
                            result_title: obj.result_title || 'NICE!',
                            result_commentary: obj.result_commentary || 'You know your stuff!',
                            result_image_url: obj.result_image_url || '',
                          };
                        }).filter(q => q.question);
                        
                        setImportedQuestions(questions);
                        toast.success(`Parsed ${questions.length} questions from CSV`);
                      };
                      reader.readAsText(file);
                      e.target.value = '';
                    }}
                  />
                </label>
                
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted rounded-xl cursor-pointer hover:border-primary transition-colors">
                  <FileJson className="w-8 h-8 mb-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Upload JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const data = JSON.parse(event.target?.result as string);
                          const questionsArray = Array.isArray(data) ? data : data.questions || [];
                          
                          const questions = questionsArray.map((q: Record<string, unknown>) => ({
                            category: (q.category as string) || 'rap',
                            question: (q.question as string) || '',
                            hint: (q.hint as string) || '',
                            options: Array.isArray(q.options) && q.options.length >= 4 
                              ? (q.options as string[]).slice(0, 4) 
                              : ['', '', '', ''],
                            correct_answer: (q.correct_answer as string) || (Array.isArray(q.options) ? (q.options[0] as string) : ''),
                            result_title: (q.result_title as string) || 'NICE!',
                            result_commentary: (q.result_commentary as string) || 'You know your stuff!',
                            result_image_url: (q.result_image_url as string) || '',
                          })).filter((q: { question: string }) => q.question);
                          
                          setImportedQuestions(questions);
                          toast.success(`Parsed ${questions.length} questions from JSON`);
                        } catch (err) {
                          console.error(err);
                          toast.error('Invalid JSON file');
                        }
                      };
                      reader.readAsText(file);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
              
              <div className="text-xs text-muted-foreground bg-secondary p-3 rounded-lg">
                <p className="font-semibold mb-1">CSV Format:</p>
                <code>category,question,options,correct_answer,hint,result_title,result_commentary</code>
                <p className="mt-1">Options separated by | or ; (e.g., "Option A|Option B|Option C|Option D")</p>
                <p className="font-semibold mb-1 mt-3">JSON Format:</p>
                <code>{`[{"category":"rap","question":"...","options":["A","B","C","D"],"correct_answer":"A"}]`}</code>
              </div>
            </div>
            
            {importedQuestions.length > 0 && (
              <div className="bg-card rounded-xl p-4 border border-border space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg text-primary">
                    PREVIEW ({importedQuestions.length} questions)
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setImportedQuestions([])}
                    >
                      Clear
                    </Button>
                    <Button
                      disabled={isImporting}
                      onClick={async () => {
                        setIsImporting(true);
                        try {
                          const questionsToInsert = importedQuestions.map(q => ({
                            category: q.category,
                            question: q.question,
                            hint: q.hint || null,
                            options: q.options,
                            correct_answer: q.correct_answer,
                            result_title: q.result_title || 'NICE!',
                            result_commentary: q.result_commentary || 'You know your stuff!',
                            result_image_url: q.result_image_url || null,
                            is_approved: true,
                          }));
                          
                          const { error } = await supabase.from('questions').insert(questionsToInsert);
                          
                          if (error) throw error;
                          
                          toast.success(`Successfully imported ${importedQuestions.length} questions!`);
                          setImportedQuestions([]);
                        } catch (err) {
                          console.error(err);
                          toast.error('Failed to import questions');
                        } finally {
                          setIsImporting(false);
                        }
                      }}
                      className="bg-success hover:bg-success/90"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {isImporting ? 'Importing...' : 'Import All'}
                    </Button>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {importedQuestions.map((q, idx) => (
                    <div key={idx} className="bg-secondary rounded-lg p-3 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <Badge className="mb-1">{q.category}</Badge>
                          <p className="font-medium">{q.question}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Options: {q.options.join(' | ')}
                          </p>
                          <p className="text-xs text-success mt-1">
                            ✓ {q.correct_answer}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setImportedQuestions(prev => prev.filter((_, i) => i !== idx))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

          {/* Categories Management Tab */}
          <TabsContent value="categories" className="space-y-4">
            {/* Create New Category */}
            <div className="bg-card rounded-xl p-4 border border-border space-y-4">
              <h3 className="font-display text-lg text-primary">CREATE NEW CATEGORY</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">ID (lowercase, no spaces)</label>
                  <Input
                    value={newCategory.id}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, id: e.target.value.toLowerCase().replace(/\s/g, '-') }))}
                    placeholder="my-category"
                    className="bg-secondary"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Name</label>
                  <Input
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Category"
                    className="bg-secondary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Emoji</label>
                  <Input
                    value={newCategory.emoji}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, emoji: e.target.value }))}
                    placeholder="📚"
                    className="bg-secondary"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Description</label>
                  <Input
                    value={newCategory.description}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Questions about..."
                    className="bg-secondary"
                  />
                </div>
              </div>
              <Button
                onClick={async () => {
                  if (!newCategory.id || !newCategory.name) {
                    toast.error('ID and Name are required');
                    return;
                  }
                  try {
                    const { error } = await supabase.from('categories').insert({
                      id: newCategory.id,
                      name: newCategory.name,
                      emoji: newCategory.emoji || '📚',
                      description: newCategory.description || null,
                    });
                    if (error) throw error;
                    toast.success('Category created!');
                    setCategories(prev => [...prev, { 
                      ...newCategory, 
                      description: newCategory.description || null,
                      is_active: true, 
                      question_count: 0 
                    }]);
                    setNewCategory({ id: '', name: '', emoji: '📚', description: '' });
                  } catch (err) {
                    console.error(err);
                    toast.error('Failed to create category');
                  }
                }}
                className="w-full font-display"
              >
                <Plus className="w-4 h-4 mr-2" /> CREATE CATEGORY
              </Button>
            </div>

            {/* Existing Categories */}
            <div className="space-y-2">
              <h3 className="font-display text-lg text-primary">EXISTING CATEGORIES</h3>
              {categories.map(cat => (
                <div
                  key={cat.id}
                  className={`bg-card rounded-xl p-4 border ${cat.is_active ? 'border-border' : 'border-destructive/50 opacity-60'} flex items-center justify-between`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.emoji}</span>
                    <div>
                      <p className="font-display">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">{cat.id} • {cat.question_count || 0} questions</p>
                    </div>
                  </div>
                  <Button
                    variant={cat.is_active ? 'outline' : 'default'}
                    size="sm"
                    onClick={async () => {
                      await supabase.from('categories').update({ is_active: !cat.is_active }).eq('id', cat.id);
                      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, is_active: !c.is_active } : c));
                      toast.success(`Category ${!cat.is_active ? 'activated' : 'deactivated'}`);
                    }}
                  >
                    {cat.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* OG Management Tab */}
        </Tabs>
      </main>
    </div>
  );
}
