import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface RequestBody {
  // Either-or: an image to analyze, or existing question text to enrich
  mode: 'auto_fill' | 'insights';
  category?: string;
  // For auto_fill:
  imageBase64?: string;
  imageMimeType?: string;
  // For insights:
  question?: string;
  correctAnswer?: string;
  options?: string[];
}

const SYSTEM_AUTOFILL = `You are an OG culture expert helping build a hood trivia quiz called HoodLingo.
The 4 categories are:
- rap: hip-hop history, lyrics, artists, albums, bars
- streets: street culture, slang, hood knowledge, neighborhoods
- flicks: classic hood movies (Friday, Boyz N The Hood, Juice, Menace II Society, etc.)
- stores: corner store / bodega culture, snacks, drinks, signage

Given a user-uploaded image, generate a single trivia question about its subject.
Voice: confident, urban, witty, never cringe. Speak like a real one.
Hint should be sly, not a giveaway.
Result title should be HYPE caps phrase (e.g. "THAT'S BARS!", "STRAIGHT UP!").
Commentary is one fun-fact sentence about the correct answer.
Insights: 2-3 sentences of cultural context for OG reviewers — why this question matters, what the culture should know.`;

const SYSTEM_INSIGHTS = `You are an OG culture expert reviewing a submitted HoodLingo trivia question.
Generate witty result title, hype commentary about the correct answer, and 2-3 sentences of cultural insights/context.
Voice: confident, urban, witty, never cringe.`;

const AUTOFILL_SCHEMA = {
  type: 'object',
  properties: {
    category: { type: 'string', enum: ['rap', 'streets', 'flicks', 'stores'] },
    question: { type: 'string' },
    hint: { type: 'string' },
    options: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
    correctAnswerIndex: { type: 'number', minimum: 0, maximum: 3 },
    resultTitle: { type: 'string' },
    resultCommentary: { type: 'string' },
    insights: { type: 'string' },
  },
  required: [
    'category', 'question', 'hint', 'options',
    'correctAnswerIndex', 'resultTitle', 'resultCommentary', 'insights',
  ],
  additionalProperties: false,
};

const INSIGHTS_SCHEMA = {
  type: 'object',
  properties: {
    resultTitle: { type: 'string' },
    resultCommentary: { type: 'string' },
    insights: { type: 'string' },
  },
  required: ['resultTitle', 'resultCommentary', 'insights'],
  additionalProperties: false,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as RequestBody;
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let messages: any[];
    let toolSchema: any;
    let toolName: string;

    if (body.mode === 'auto_fill') {
      if (!body.imageBase64) {
        return new Response(JSON.stringify({ error: 'imageBase64 required for auto_fill' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const mime = body.imageMimeType || 'image/png';
      const dataUrl = body.imageBase64.startsWith('data:')
        ? body.imageBase64
        : `data:${mime};base64,${body.imageBase64}`;

      const categoryHint = body.category
        ? `Suggested category: ${body.category}. Confirm or pick a better fit.`
        : 'Pick the best-fitting category.';

      messages = [
        { role: 'system', content: SYSTEM_AUTOFILL },
        {
          role: 'user',
          content: [
            { type: 'text', text: `Look at this image and generate a trivia question. ${categoryHint}` },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ];
      toolSchema = AUTOFILL_SCHEMA;
      toolName = 'submit_question';
    } else if (body.mode === 'insights') {
      if (!body.question || !body.correctAnswer) {
        return new Response(JSON.stringify({ error: 'question and correctAnswer required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const optsText = body.options?.length
        ? `\nOptions: ${body.options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join('  ')}`
        : '';
      messages = [
        { role: 'system', content: SYSTEM_INSIGHTS },
        {
          role: 'user',
          content: `Category: ${body.category || 'unknown'}
Question: ${body.question}
Correct Answer: ${body.correctAnswer}${optsText}

Generate hype commentary and cultural insights.`,
        },
      ];
      toolSchema = INSIGHTS_SCHEMA;
      toolName = 'submit_insights';
    } else {
      return new Response(JSON.stringify({ error: 'invalid mode' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        tools: [
          {
            type: 'function',
            function: {
              name: toolName,
              description: 'Return the generated trivia data',
              parameters: toolSchema,
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: toolName } },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('analyze failed', res.status, text);
      const status = res.status === 429 || res.status === 402 ? res.status : 500;
      return new Response(
        JSON.stringify({
          error:
            res.status === 429
              ? 'Rate limited. Try again in a moment.'
              : res.status === 402
                ? 'AI credits exhausted. Add credits in workspace settings.'
                : 'AI analysis failed',
          detail: text,
        }),
        { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const json = await res.json();
    const toolCall = json?.choices?.[0]?.message?.tool_calls?.[0];
    const argsRaw = toolCall?.function?.arguments;
    if (!argsRaw) {
      return new Response(JSON.stringify({ error: 'No structured output returned' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let parsed: any;
    try {
      parsed = typeof argsRaw === 'string' ? JSON.parse(argsRaw) : argsRaw;
    } catch {
      return new Response(JSON.stringify({ error: 'Failed to parse AI output' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('analyze-question-image error', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
