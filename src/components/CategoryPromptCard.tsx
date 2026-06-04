import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import flicksImg from '@/assets/category-prompts/flicks.jpg';
import storesImg from '@/assets/category-prompts/stores.jpg';
import streetsImg from '@/assets/category-prompts/streets.jpg';
import rapImg from '@/assets/category-prompts/rap.jpg';

type CategoryKey = 'rap' | 'streets' | 'flicks' | 'stores';

const CATEGORY_META: Record<CategoryKey, {
  label: string;
  prompt: string;
  image: string;
  hint: string;
}> = {
  rap: {
    label: 'RAP',
    prompt: 'Bars on deck? Add a rap question.',
    image: rapImg,
    hint: 'Think classic vinyl, gold chains, the mic.',
  },
  streets: {
    label: 'IN THESE STREETS',
    prompt: 'Street smart? Add a streets question.',
    image: streetsImg,
    hint: 'Crips vs. Bloods, block knowledge.',
  },
  flicks: {
    label: 'HOOD FLICKS',
    prompt: 'Know your classics? Add a movie question.',
    image: flicksImg,
    hint: 'Friday, Boyz N The Hood, Juice.',
  },
  stores: {
    label: 'CORNER STORES',
    prompt: 'Bodega expert? Drop a store question.',
    image: storesImg,
    hint: 'The bodega cat on the bread knows.',
  },
};

interface CategoryPromptCardProps {
  category: CategoryKey;
  onClick: (category: CategoryKey) => void;
}

export function CategoryPromptCard({ category, onClick }: CategoryPromptCardProps) {
  const [hovered, setHovered] = useState(false);
  const meta = CATEGORY_META[category];

  return (
    <motion.button
      type="button"
      onClick={() => onClick(category)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setTimeout(() => setHovered(false), 1200)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative w-full overflow-hidden rounded-xl border border-primary/30 bg-card/80 p-4 text-left transition-colors hover:border-primary"
    >
      {/* Hover image overlay */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 z-0"
          >
            <img
              src={meta.image}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-heading text-xl tracking-wider text-primary">
            {meta.label}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {hovered ? meta.hint : meta.prompt}
          </p>
        </div>
        <span className="font-display text-2xl text-accent">+</span>
      </div>
    </motion.button>
  );
}

interface CategoryPromptsProps {
  excluding: string;
  onPick: (category: string) => void;
}

const ALL_CATEGORIES: CategoryKey[] = ['rap', 'streets', 'flicks', 'stores'];

export function CategoryPrompts({ excluding, onPick }: CategoryPromptsProps) {
  const others = ALL_CATEGORIES.filter((c) => c !== excluding);
  return (
    <div className="space-y-3">
      <p className="text-center font-display text-sm text-muted-foreground">
        🎤 GOT HEAT FOR THESE? DROP A QUESTION
      </p>
      <div className="space-y-2">
        {others.map((c) => (
          <CategoryPromptCard key={c} category={c} onClick={onPick} />
        ))}
      </div>
    </div>
  );
}
