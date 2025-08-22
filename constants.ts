
import type { Theme, Stim } from './types';

export const THEMES: Theme[] = [
  { id: 't1', name: 'Midnight Quill', className: 'theme-midnight', cost: 0 },
  { id: 't2', name: 'Arcade Dream', className: 'theme-arcade', cost: 100 },
  { id: 't3', name: 'Ancient Scroll', className: 'theme-scroll', cost: 150 },
  { id: 't4', name: 'Solaris', className: 'theme-solaris', cost: 200 },
];

export const INITIAL_SHOP_ITEMS: Stim[] = [
  ...THEMES.filter(t => t.cost > 0).map((t): Stim => ({
      id: t.id,
      name: `${t.name} Theme`,
      description: `A new visual theme for your UI.`,
      cost: t.cost,
      type: 'theme',
      effect: t,
  })),
  { id: 's1', name: 'Inspiration Spark', description: 'Generates a random word to inspire you.', cost: 50, type: 'tool' },
  { id: 's2', name: 'Word Weave', description: 'Highlights complex sentences in your last entry.', cost: 75, type: 'tool' },
  { id: 's3', name: "Editor's Eye", description: 'Get instant, AI-powered constructive feedback on your current draft.', cost: 200, type: 'tool' },
  { id: 's4', name: 'Health Potion', description: 'Heals 1 heart after writing if injured. Contains 3 doses.', cost: 10, type: 'tool', uses: 3 },
];

export const DIFFICULTY_SETTINGS = {
  Easy: { timer: 120, monsterHpMultiplier: 0.8, wordDamageMultiplier: 1.5, dodgeWordCount: 25 },
  Normal: { timer: 90, monsterHpMultiplier: 1.0, wordDamageMultiplier: 1.0, dodgeWordCount: 40 },
  Hard: { timer: 60, monsterHpMultiplier: 1.2, wordDamageMultiplier: 0.8, dodgeWordCount: 60 },
};