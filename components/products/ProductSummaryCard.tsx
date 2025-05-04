import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductSummaryCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    className?: string;
}

export function ProductSummaryCard({
    title,
    value,
    icon,
    className,
}: ProductSummaryCardProps) {
    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}
