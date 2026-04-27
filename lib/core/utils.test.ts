import { describe, it, expect } from 'vitest';
import { compactSlots, refillSlots } from './utils';
import { SUIT, type Card, type Slot } from './game-machine';

describe(compactSlots.name, () => {
  it('should move all cards to the right and fill with null', () => {
    const slots: Slot[] = [null, { rank: 5, suit: SUIT.HEARTS }, null, { rank: 10, suit: SUIT.DIAMONDS }];

    expect(compactSlots(slots)).toEqual([
      null,
      null,
      { rank: 5, suit: SUIT.HEARTS },
      { rank: 10, suit: SUIT.DIAMONDS },
    ]);
  });

  it('should leave an already compact array unchanged', () => {
    const slots: Slot[] = [
      null,
      null,
      { rank: 2, suit: SUIT.CLUBS },
      { rank: 3, suit: SUIT.SPADES },
    ];
    expect(compactSlots(slots)).toEqual(slots);
  });
});

describe(refillSlots.name, () => {
  it('should refill empty slots from the deck (right to left)', () => {
    const slots: Slot[] = [null, null, null, null];
    const deck: Card[] = [
      { rank: 7, suit: SUIT.HEARTS },
      { rank: 8, suit: SUIT.DIAMONDS },
    ];
    const { updatedSlots, updatedDeck } = refillSlots({ slots, deck });
    expect(updatedSlots).toEqual([null, null, { rank: 8, suit: SUIT.DIAMONDS }, { rank: 7, suit: SUIT.HEARTS }]);
    expect(updatedDeck).toEqual([]);
  });

  it('should leave remaining slots unfilled if the deck is empty', () => {
    const slots: Slot[] = [null, null, null, null];
    const deck: Card[] = [
      { rank: 9, suit: SUIT.SPADES },
    ];
    const { updatedSlots, updatedDeck } = refillSlots({ slots, deck });
    expect(updatedSlots).toEqual([null, null, null, { rank: 9, suit: SUIT.SPADES }]);
    expect(updatedDeck).toEqual([]);
  });

  it('should leave filled slots unchanged', () => {
    const slots: Slot[] = [null, { rank: 4, suit: SUIT.CLUBS }, null, null];
    const deck: Card[] = [{ rank: 2, suit: SUIT.DIAMONDS }];
    const { updatedSlots, updatedDeck } = refillSlots({ slots, deck });
    expect(updatedSlots).toEqual([null, { rank: 4, suit: SUIT.CLUBS }, null, { rank: 2, suit: SUIT.DIAMONDS }]);
    expect(updatedDeck).toEqual([]);
  });
});