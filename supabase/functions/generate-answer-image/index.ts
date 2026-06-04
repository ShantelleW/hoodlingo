import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface RequestBody {
  prompt: string;
  kind: 'correct' | 'wrong';
  referenceImageBase64?: string; // data URL or raw base64
  referenceMimeType?: string;
  category?: string;
  optionText?: string;
  allOptions?: string[];
  question?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as RequestBody;
    const { prompt, kind, referenceImageBase64, referenceMimeType, category } = body;

    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const categoryHint = category
      ? `Category: ${category}. Match the visual language of that category (rap = hip-hop/vinyl/chains, streets = urban gritty, flicks = cinematic 90s hood-movie, stores = bodega/neon).`
      : '';

    const styleHint =
      kind === 'wrong'
        ? `A bold, comedic "WRONG ANSWER" reaction image. Urban hip-hop aesthetic, vibrant magenta/red/purple, single expressive subject centered, exaggerated meme-style energy, dramatic lighting. ${categoryHint} Square 1:1 composition.`
        : `A bold, celebratory "RIGHT ANSWER" hype image. Urban hip-hop aesthetic, vibrant gold/purple/cyan, single hero subject centered, triumphant energy, dramatic lighting. ${categoryHint} Square 1:1 composition.`;

    // Build content — multimodal if reference image is provided
    const userContent: any[] = [
      { type: 'text', text: `${styleHint}\n\nSubject: ${prompt}` },
    ];

    if (referenceImageBase64) {
      const mime = referenceMimeType || 'image/png';
      const dataUrl = referenceImageBase64.startsWith('data:')
        ? referenceImageBase64
        : `data:${mime};base64,${referenceImageBase64}`;
      userContent.unshift({
        type: 'text',
        text: 'Use the attached image as a visual reference for style, subject, colors, and composition. Reinterpret it in the requested style — do not copy it directly.',
      });
      userContent.push({
        type: 'image_url',
        image_url: { url: dataUrl },
      });
    }

    const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [{ role: 'user', content: userContent }],
        modalities: ['image', 'text'],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Gemini image gen failed', res.status, text);
      return new Response(
        JSON.stringify({ error: 'AI image generation failed', detail: text }),
        { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const json = await res.json();
    const imageUrl = json?.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'No image returned' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return both keys for backwards compatibility
    return new Response(JSON.stringify({ imageUrl, url: imageUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('generate-answer-image error', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
