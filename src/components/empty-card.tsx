import { Card } from "#/components/ui/card";

export function EmptyCard() {
	return (
		<Card className="relative flex h-24 w-14 flex-col items-center border-2 border-dashed font-black text-xs ring-0 sm:h-36 sm:text-xl md:w-24">
			<div data-slot="empty-card" />
		</Card>
	);
}
