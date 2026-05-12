export const SUIT = {
	HEARTS: "HEARTS",
	DIAMONDS: "DIAMONDS",
	CLUBS: "CLUBS",
	SPADES: "SPADES",
} as const;

type Suit = (typeof SUIT)[keyof typeof SUIT];

export type Joker = {
	id: string;
	value: 0;
	suit: null;
};

export type RegularCard = {
	id: string;
	value: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;
	suit: Suit;
};

export type PlayingCard = RegularCard | Joker;

export type Slot = PlayingCard | null;

function generateCardId(): string {
	return crypto.randomUUID();
}

export function createDecks() {
	const playerDeck: PlayingCard[] = [];
	const enemyDeck: PlayingCard[] = [];

	for (const suit of Object.values(SUIT)) {
		for (const value of [2, 3, 4] as const) {
			playerDeck.push({ id: generateCardId(), suit, value });
		}

		for (const value of [5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const) {
			enemyDeck.push({ id: generateCardId(), suit, value });
		}
	}

	playerDeck.push({ id: generateCardId(), value: 0, suit: null });
	playerDeck.push({ id: generateCardId(), value: 0, suit: null });

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
