import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "default" | "sm" | "lg";
}

export function Spinner({
    className,
    size = "default",
    ...props
}: SpinnerProps) {
    return (
        <div
            className={cn("flex items-center justify-center", className)}
            {...props}
        >
            <Loader2
                className={cn(
                    "animate-spin",
                    size === "default" && "h-6 w-6",
                    size === "sm" && "h-4 w-4",
                    size === "lg" && "h-8 w-8"
                )}
            />
        </div>
    );
}
