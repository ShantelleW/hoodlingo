import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

interface Body {
  prompt: string;
  kind: 'correct' | 'wrong';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { prompt, kind } = await req.json() as Body;
    if (!prompt || prompt.length > 500) {
      return new Response(JSON.stringify({ error: 'Invalid prompt' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const styled = kind === 'correct'
      ? `Urban hip-hop celebration vibe, vibrant, gold accents, dynamic. ${prompt}`
      : `Urban hip-hop disappointed/funny "wrong answer" vibe, dramatic, dark purple. ${prompt}`;

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [{ role: 'user', content: styled }],
        modalities: ['image', 'text'],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: 'Rate limited, try again shortly.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: 'AI credits exhausted. Add credits in workspace settings.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      return new Response(JSON.stringify({ error: 'AI failed', detail: errText }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const json = await aiRes.json();
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) return new Response(JSON.stringify({ error: 'No image returned' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // Upload to storage as user
    const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const path = `${user.id}/${crypto.randomUUID()}.png`;
    const service = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { error: upErr } = await service.storage.from('submission-images').upload(path, bytes, { contentType: 'image/png' });
    if (upErr) throw upErr;
    const { data: pub } = service.storage.from('submission-images').getPublicUrl(path);

    return new Response(JSON.stringify({ url: pub.publicUrl }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
