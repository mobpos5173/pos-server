"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import TransactionList from "@/components/TransactionList";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DateRange } from "@/lib/export/types";
import { exportTransactions } from "@/lib/export/transactions";
import { exportProducts } from "@/lib/export/products";
import { useTransactions } from "@/hooks/use-transactions";
import { ExportType } from "@/lib/export/types";
import { filterTransactionsByDate } from "@/lib/export/date-filters";
import { useMemo } from "react";
import { TransactionItem } from "@/types";

export default function TransactionsPage() {
    const { userId } = useAuth();
    const [dateRange, setDateRange] = useState<DateRange>("month");
    const [exportType, setExportType] = useState<ExportType>("transactions");
    const { transactions, loading, error, refreshTransactions } =
        useTransactions();
    const [isExporting, setIsExporting] = useState(false);

    // Filter transactions based on selected date range
    const filteredTransactions = filterTransactionsByDate(
        transactions,
        dateRange
    );

    // Get date range label for display
    const dateRangeLabel = useMemo(() => {
        switch (dateRange) {
            case "daily":
                return "Today";
            case "yesterday":
                return "Yesterday";
            case "week":
                return "Last Week";
            case "month":
                return "Last Month";
            case "3months":
                return "Last 3 Months";
            case "annual":
                return "Annual";
            default:
                return "Selected Period";
        }
    }, [dateRange]);

    // Calculate metrics based on filtered transactions
    const metrics = useMemo(() => {
        // Calculate total sales (excluding refunds)
        const totalSales = filteredTransactions.reduce(
            (sum, transaction) =>
                sum + (transaction.totalPrice - (transaction.totalRefund || 0)),
            0
        );

        // Calculate total cost from items (excluding refunded items)
        const totalCost = filteredTransactions.reduce((sum, transaction) => {
            try {
                const items = JSON.parse(
                    transaction.items || "[]"
                ) as TransactionItem[];
                const refundedAmount = transaction.totalRefund || 0;
                const refundRatio =
                    refundedAmount > 0
                        ? refundedAmount / transaction.totalPrice
                        : 0;

                // Adjust cost based on refund ratio
                const itemsCost = items.reduce(
                    (itemSum, item) =>
                        itemSum + item.quantity * (item.productBuyPrice || 0),
                    0
                );

                return sum + itemsCost * (1 - refundRatio);
            } catch (error) {
                console.error("Error parsing transaction items:", error);
                return sum;
            }
        }, 0);

        // Calculate margin
        const margin = totalSales - totalCost;
        const marginPercentage =
            totalSales > 0 ? (margin / totalSales) * 100 : 0;

        // Count only non-refunded transactions
        const totalTransactions = filteredTransactions.filter(
            (t) =>
                t.status !== "refunded" && t.totalPrice > (t.totalRefund || 0)
        ).length;

        return {
            totalSales,
            totalCost,
            margin,
            marginPercentage,
            totalTransactions,
        };
    }, [filteredTransactions]);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            if (exportType === "transactions") {
                await exportTransactions(filteredTransactions, dateRange);
            } else {
                await exportProducts(filteredTransactions, dateRange);
            }
        } catch (error) {
            console.error("Error exporting data:", error);
        } finally {
            setIsExporting(false);
        }
    };

    if (!userId) {
        return <div>Please sign in to view transactions</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Transactions</h1>
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
                    <Select
                        value={exportType}
                        onValueChange={(value: ExportType) =>
                            setExportType(value)
                        }
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select export type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="transactions">
                                Transactions
                            </SelectItem>
                            <SelectItem value="products">
                                Product Sales
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleExport} disabled={isExporting}>
                        Export to Excel
                    </Button>
                </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg mb-4">
                <h2 className="text-lg font-medium mb-2">
                    {dateRangeLabel} Transactions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-muted-foreground">
                            Total Transactions
                        </p>
                        <p className="text-2xl font-bold">
                            {filteredTransactions.length}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-muted-foreground">
                            Total Revenue
                        </p>
                        <p className="text-2xl font-bold">
                            PHP{metrics.totalSales.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>

            <TransactionList
                transactions={filteredTransactions}
                loading={loading}
                onTransactionUpdated={refreshTransactions}
            />
        </div>
    );
}
