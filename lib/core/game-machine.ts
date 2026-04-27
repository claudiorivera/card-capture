import { createMachine } from 'xstate';

export type GameContext = {
  playerSlots: (Card | null)[];
  playerDeck: Card[];
  playerDiscardPile: Card[];
  enemySlots: (Card | null)[];
  enemyDeck: Card[];
  enemyDiscardPile: Card[];
};

export const SUIT = {
  HEARTS: "HEARTS",
  DIAMONDS: "DIAMONDS",
  CLUBS: "CLUBS",
  SPADES: "SPADES",
} as const;

export type Suit = typeof SUIT[keyof typeof SUIT];

export type Card = {
  rank: 0 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14; // 0 = Jokers
  suit: Suit | null; // Jokers use null
};

export type Slot = Card | null;

const initialContext: GameContext = {
  playerSlots: [null, null, null, null],
  playerDeck: [],
  playerDiscardPile: [],
  enemySlots: [null, null, null, null],
  enemyDeck: [],
  enemyDiscardPile: [],
};

export const gameMachine = createMachine({
  id: 'gameMachine',
  context: initialContext,
  initial: 'enemyPhase',
  states: {
    enemyPhase: {
      entry: ['compactEnemySlots', 'refillEnemySlots'],
      on: { NEXT: 'discardPhase' },
    },
    discardPhase: {
      on: { NEXT: 'drawPhase' },
    },
    drawPhase: {
      on: { NEXT: 'capturePhase' },
    },
    capturePhase: {
      on: { NEXT: 'enemyPhase' },
    },
  },
});