import type { ComponentProps } from "react";
import { Joker } from "#/components/joker";
import { RegularCard } from "#/components/regular-card";
import { Card } from "#/components/ui/card";
import type { PlayingCard as PlayingCardType } from "#/lib/core/cards";
import { isJoker } from "#/lib/core/utils";
import { cn } from "#/lib/utils";

export function PlayingCard({
	card,
	className,
	...props
}: ComponentProps<typeof Card> & { card: PlayingCardType }) {
	return (
		<Card
			className={cn(
				"flex h-24 w-14 flex-col items-center justify-center border-2 font-black text-xs sm:h-36 sm:text-xl md:w-24",
				"has-data-red-suit:text-red-500",
				"group-data-[state=selected]/card-slot:animate-wiggle group-data-[state=selected]/card-slot:border-blue-500",
				className,
			)}
			{...props}
		>
			{isJoker(card) ? <Joker /> : <RegularCard card={card} />}
		</Card>
	);
}
