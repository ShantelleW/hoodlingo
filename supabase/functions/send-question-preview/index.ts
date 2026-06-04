import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { submissionId } = await req.json();
    const service = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: sub } = await service.from('question_submissions').select('*').eq('id', submissionId).eq('submitted_by', user.id).single();
    if (!sub) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const email = user.email;
    if (!email) return new Response(JSON.stringify({ ok: false, reason: 'no_email' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { error } = await service.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'question-preview',
        recipientEmail: email,
        idempotencyKey: `qpreview-${submissionId}`,
        templateData: {
          category: sub.category,
          question: sub.question,
          options: sub.options,
          correctAnswer: sub.correct_answer,
          hint: sub.hint,
          resultTitle: sub.result_title,
          resultCommentary: sub.result_commentary,
          correctImageUrl: sub.correct_image_url,
          wrongImageUrl: sub.wrong_image_url,
        },
      },
    });
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
