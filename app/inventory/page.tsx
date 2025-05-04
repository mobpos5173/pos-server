"use client";

import { useAuth } from "@clerk/nextjs";
import ProductList from "@/components/products/ProductList";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DateRange } from "@/types";
import { useState } from "react";
import { exportProducts } from "@/lib/export/products";
import { useTransactions } from "@/hooks/use-transactions";

export default function ProductsPage() {
    const { userId } = useAuth();
    const [dateRange, setDateRange] = useState<DateRange>("month");
    const { transactions } = useTransactions();

    if (!userId) {
        return <div>Please sign in to view inventory</div>;
    }

    const handleExport = () => {
        exportProducts(transactions, dateRange);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Inventory</h1>
                <div className="flex gap-4 items-center">
                    <Select
                        value={dateRange}
                        onValueChange={(value: DateRange) =>
                            setDateRange(value)
                        }
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select date range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Today</SelectItem>
                            <SelectItem value="yesterday">Yesterday</SelectItem>
                            <SelectItem value="week">Last Week</SelectItem>
                            <SelectItem value="month">Last Month</SelectItem>
                            <SelectItem value="3months">
                                Last 3 Months
                            </SelectItem>
                            <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleExport}>Export to Excel</Button>
                </div>
            </div>

            <ProductList options={{ type: "inventory" }} />
        </div>
    );
}
