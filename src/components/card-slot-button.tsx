import type { ComponentProps } from "react";
import { cn } from "#/lib/utils";

export function CardSlotButton({
	className,
	children,
	isSelected,
	...props
}: ComponentProps<"button"> & {
	isSelected: boolean;
}) {
	return (
		<button
			type="button"
			data-state={isSelected ? "selected" : undefined}
			className={cn("group/card-slot cursor-pointer", className)}
			{...props}
		>
			{children}
		</button>
	);
}
