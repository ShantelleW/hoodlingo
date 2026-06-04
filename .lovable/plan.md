# Auto-Generate Answer Images with Preview & Re-Run

Expand the AI image flow in `SubmitQuestionModal` so that, once a reference image and question/options are set, the agent generates a tailored image for **every answer slot** (the correct answer + each wrong option), shows them in a preview grid, and lets the user re-roll any single image before submitting.

## UX flow

1. User uploads a reference image and fills in question + 4 options (or uses Auto-Fill).
2. New **"Generate All Answer Images"** button appears in the AI Assist card.
3. Edge function is called once per option in parallel:
   - Correct option → "right answer / hype" styling.
   - Each wrong option → "wrong answer / comedic reaction" styling, prompt tailored to that specific wrong option text.
   - All four calls pass the same reference image as visual context.
4. Results render in a 2x2 **Preview Grid** with:
   - Option letter (A/B/C/D) + text label.
   - Badge: ✅ Correct / ❌ Wrong.
   - Per-tile **Re-Run** button (regenerates just that tile).
   - Per-tile **Replace with Upload** button (manual override).
   - Loading shimmer per-tile while generating.
5. On submit, the correct option's image is saved as `correct_image_url`; a representative wrong image (first wrong, or the one matching the option the player picked at runtime — for now, first wrong) is saved as `wrong_image_url`. All four per-option images are also persisted on the submission so the game can show the exact image for whichever wrong option the player chose.

## Data changes

- Add `option_images jsonb` column to `question_submissions` (array of 4 URLs aligned to `options`). Nullable, defaults `[]`.
- Mirror on `questions` table (`option_images jsonb`) so approved questions carry per-option images into gameplay.
- Migration includes grants + keeps existing RLS untouched.
- `ResultScreen` / quiz rendering: when `option_images` exists, show the image for the option the player actually picked; otherwise fall back to existing `correct_image_url` / `wrong_image_url`.

## Frontend changes (`SubmitQuestionModal.tsx`)

- Replace the two single ImageSlots with a new `<AnswerImageGrid />` (in-file component) that owns `optionImages: (string|null)[]` state.
- Add `generatingIndex: Set<number>` for per-tile spinners.
- New `handleGenerateAll()` — fires 4 parallel `generate-answer-image` invocations.
- New `handleRegenerate(index)` — single tile re-roll.
- Keep existing `correctImg` / `wrongImg` derived from `optionImages` for backward compatibility with current DB columns.
- Keep the existing "AI Remix" buttons on individual slots removed in favor of the grid (cleaner UX).

## Edge function changes (`generate-answer-image/index.ts`)

- Accept optional `optionText` and `allOptions` in the body so the prompt can say e.g. *"This is the WRONG answer 'Tupac' for the question 'Who produced Illmatic?' — make a comedic reaction image showing why it's wrong"*.
- No model change; still `google/gemini-2.5-flash-image` with the reference image as multimodal context.

## Technical details

```text
SubmitQuestionModal
├── AI Assist card
│   ├── Reference image upload
│   ├── Auto-Fill button
│   └── [NEW] Generate All Answer Images button
└── AnswerImageGrid (2x2)
    ├── Tile A [Correct ✅]  → preview · Re-run · Upload
    ├── Tile B [Wrong ❌]    → preview · Re-run · Upload
    ├── Tile C [Wrong ❌]    → preview · Re-run · Upload
    └── Tile D [Wrong ❌]    → preview · Re-run · Upload
```

- Parallelism: `Promise.allSettled` so one failure doesn't kill the batch; failed tiles show a Retry state.
- Rate-limit handling: surface 429/402 toasts per tile.
- Submit guard: allow submitting even if some tiles are empty (graceful degradation).

## Files touched

- `supabase/migrations/<new>.sql` — add `option_images jsonb` to `question_submissions` and `questions`.
- `src/components/SubmitQuestionModal.tsx` — new grid + batch generation + re-run.
- `supabase/functions/generate-answer-image/index.ts` — accept `optionText` / `allOptions` for tailored prompts.
- `src/components/ResultScreen.tsx` — prefer `option_images[pickedIndex]` when available.

## Out of scope

- True animated GIFs (still static PNGs).
- Changing approval/admin flow — admins still see the same submission, just richer.
