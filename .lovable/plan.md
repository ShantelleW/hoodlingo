# Plan: Category Submission Prompts with Hover Examples

## Where it goes

On the **Game Over screen** (`src/components/GameOverScreen.tsx`), below the existing "Submit a Question" CTA, add a new section: **"Got heat for these? Drop a question."**

It renders 3 cards — one for each category the user did NOT just play. (If they just played Flicks, they see Rap, Streets, Stores.)

## Card behavior

Each card:
- Shows the category name + a one-line prompt
- On **hover** (desktop) / **long-press** (mobile), reveals an example image grid behind/over the card with a subtle scale + fade animation
- On **click**, opens `SubmitQuestionModal` pre-targeted to that category (extend the existing `onSubmitQuestion` to accept an optional category arg, then thread it through `Index.tsx` so the modal opens with that category instead of `currentCategory`)

## Example imagery per category

| Category | Prompt | Hover examples |
|---|---|---|
| Hood Flicks | "Know your classics? Add a movie question." | 3 stylized movie-poster collages evoking Friday, Boyz N The Hood, Juice |
| Corner Stores | "Bodega expert? Drop a store question." | 1 image: cat napping on a stack of bread loaves in a bodega aisle |
| In These Streets | "Street smart? Add a streets question." | 1 image: red and blue bandanas crossed on concrete (Crips vs Bloods, non-graphic) |
| Rap (fallback when not played) | "Bars on deck? Add a rap question." | Stylized vinyl + mic + gold chain still life |

**Image sourcing:** Generate once using the agent's `imagegen` tool and save as project assets under `src/assets/category-prompts/` (then externalize via `lovable-assets`). We will use **stylized, non-IP representations** — e.g. "1990s South Central LA movie-poster collage with red Chevy lowrider, palm trees, and barbershop" rather than literal "Friday" poster. This avoids copyright/content-policy rejections and Apple review issues. Same applies to the Crips/Bloods example — colored bandanas only, no gang iconography or weapons.

## Files touched

- **New**: 4 generated images in `src/assets/category-prompts/` (rap, flicks, stores, streets) — externalized via `lovable-assets`
- **New**: `src/components/CategoryPromptCard.tsx` — single card with hover-reveal logic (framer-motion `whileHover`, `AnimatePresence` for the image overlay)
- **Edited**: `src/components/GameOverScreen.tsx` — render `<CategoryPrompts excluding={category} onPick={onSubmitQuestion} />` block
- **Edited**: `src/pages/Index.tsx` — change `onSubmitQuestion` signature to `(category?: string) => void`, store selected category in state, pass to `SubmitQuestionModal`
- **Edited**: `src/components/SideMenu.tsx` — keep existing signature; passes `undefined` so it uses current category (no behavior change)

## Design notes

- Cards use existing `quiz-card` styling, Bebas Neue category names, muted prompt text
- Hover overlay: image fills card with 0.85 opacity, dark gradient bottom-up for legibility, category label stays visible
- Mobile: tap-and-hold for 300ms reveals the image; tap releases. Plain tap = open modal.
- All copy in the urban/hip-hop voice already established

## Out of scope

- No changes to `SubmitQuestionModal` itself beyond receiving a pre-selected category prop (already takes `category`)
- No backend/RLS changes
- No new analytics events (can add later)
