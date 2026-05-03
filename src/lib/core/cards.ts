export const SUIT = {
	HEARTS: "HEARTS",
	DIAMONDS: "DIAMONDS",
	CLUBS: "CLUBS",
	SPADES: "SPADES",
} as const;

export type Suit = (typeof SUIT)[keyof typeof SUIT];

export type Joker = {
	value: 0;
	suit: null;
};

export type PlayingCard =
	| {
			value: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;
			suit: Suit;
	  }
	| Joker;

export type Slot = PlayingCard | null;

export function createDecks() {
	const playerDeck: PlayingCard[] = [];
	const enemyDeck: PlayingCard[] = [];

	for (const suit of Object.values(SUIT)) {
		for (const value of [2, 3, 4] as const) {
			playerDeck.push({ suit, value });
		}

		for (const value of [5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const) {
			enemyDeck.push({ suit, value });
		}
	}

	playerDeck.push({ value: 0, suit: null });
	playerDeck.push({ value: 0, suit: null });

	return {
		playerDeck: shuffle(playerDeck),
		enemyDeck: shuffle(enemyDeck),
	};
}

export function shuffle(deck: PlayingCard[]): PlayingCard[] {
	const shuffledDeck: PlayingCard[] = [...deck];

	for (let i = shuffledDeck.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));

		const cardAtJ = shuffledDeck.at(j);
		const cardAtI = shuffledDeck.at(i);

		if (cardAtJ && cardAtI) {
			[shuffledDeck[i], shuffledDeck[j]] = [cardAtJ, cardAtI];
		}
	}

	return shuffledDeck;
}
