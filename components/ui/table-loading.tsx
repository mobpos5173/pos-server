import { TableCell, TableRow } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";

interface TableLoadingProps {
    columns: number;
}

export function TableLoading({ columns }: TableLoadingProps) {
    return (
        <TableRow>
            <TableCell colSpan={columns} className="h-24">
                <div className="flex items-center justify-center">
                    <Spinner className="text-muted-foreground" />
                </div>
            </TableCell>
        </TableRow>
    );
}
