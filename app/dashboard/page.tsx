"use client";

import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Package,
    QrCode,
    Receipt,
    Wallet,
    PiggyBank,
    AlertTriangle,
} from "lucide-react";
import { AreaChart, BarChart } from "@tremor/react";
import { useTransactions } from "@/hooks/use-transactions";
import { useProducts } from "@/hooks/use-products";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DateRange, TransactionItem } from "@/types";
import { filterTransactionsByDate } from "@/lib/export/date-filters";
import { format } from "date-fns";

export default function DashboardPage() {
    const { userId } = useAuth();
    const { transactions } = useTransactions();
    const { products } = useProducts();
    const router = useRouter();
    const [dateRange, setDateRange] = useState<DateRange>("month");

    // Filter transactions based on date range
    const filteredTransactions = filterTransactionsByDate(
        transactions,
        dateRange
    );

    // Get expired products
    const expiredProducts = products
        .filter((product) => {
            if (!product.expirationDate) return false;
            const expirationDate = new Date(product.expirationDate);
            return expirationDate < new Date();
        })
        .sort((a, b) => {
            // Sort by expiration date (most recently expired first)
            if (!a.expirationDate || !b.expirationDate) return 0;
            return (
                new Date(b.expirationDate).getTime() -
                new Date(a.expirationDate).getTime()
            );
        });

    // Calculate monthly data for the area chart
    const monthlyData = useMemo(() => {
        const monthlyTotals: { [key: string]: number } = {};
        filteredTransactions.forEach((transaction) => {
            const date = new Date(transaction.dateOfTransaction);
            const monthYear = `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, "0")}`;

            // Calculate net amount after refunds
            const netAmount =
                transaction.totalPrice - (transaction.totalRefund || 0);

            monthlyTotals[monthYear] =
                (monthlyTotals[monthYear] || 0) + netAmount;
        });

        return Object.entries(monthlyTotals)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, total]) => ({
                date,
                "Total Sales": total,
            }));
    }, [filteredTransactions]);

    // Calculate yearly comparison data for the bar chart
    const yearlyData = useMemo(() => {
        const yearlyTotals: { [key: string]: number } = {};
        filteredTransactions.forEach((transaction) => {
            const year = new Date(transaction.dateOfTransaction).getFullYear();
            // Calculate net amount after refunds
            const netAmount =
                transaction.totalPrice - (transaction.totalRefund || 0);
            yearlyTotals[year] = (yearlyTotals[year] || 0) + netAmount;
        });

        return Object.entries(yearlyTotals)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([year, total]) => ({
                year,
                "Total Sales": total,
            }));
    }, [filteredTransactions]);

    // Calculate metrics based on filtered transactions
    const metrics = useMemo(() => {
        // Calculate total sales (excluding refunds)
        const totalSales = filteredTransactions.reduce(
            (sum, transaction) =>
                sum + (transaction.totalPrice - (transaction.totalRefund || 0)),
            0
        );

        // Calculate total cost from transactions (excluding refunds)
        const totalCost = filteredTransactions.reduce((sum, transaction) => {
            try {
                const items = JSON.parse(transaction.items || '[]') as TransactionItem[];
                const refundedItems = JSON.parse(transaction.refundedItems || '[]') as Array<{
                    productId: number;
                    quantity: number;
                    amount: number;
                }>;

                // Calculate cost of regular items
                const itemsCost = items.reduce((itemSum, item) => 
                    itemSum + (item.quantity * item.productBuyPrice), 0);

                // Subtract cost of refunded items
                const refundedCost = refundedItems.reduce((refundSum, refund) => {
                    const matchingItem = items.find(item => item.productId === refund.productId);
                    return refundSum + ((matchingItem?.productBuyPrice || 0) * refund.quantity);
                }, 0);

                return sum + (itemsCost - refundedCost);
            } catch (error) {
                console.error("Error calculating transaction cost:", error);
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

    // Extract and aggregate items sold
    const itemsSold = useMemo(() => {
        const itemMap = new Map<
            number,
            {
                id: number;
                name: string;
                quantity: number;
                totalSales: number;
                buyPrice: number;
                sellPrice: number;
                profit: number;
            }
        >();

        filteredTransactions.forEach((transaction) => {
            try {
                // Parse regular items
                const items = JSON.parse(transaction.items || "[]") as TransactionItem[];
                
                // Parse refunded items
                const refundedItems = JSON.parse(transaction.refundedItems || "[]") as Array<{
                    productId: number;
                    quantity: number;
                    amount: number;
                }>;

                // Create a map of refunded quantities by product ID
                const refundedQuantities = new Map<number, number>();
                refundedItems.forEach((refundItem) => {
                    refundedQuantities.set(
                        refundItem.productId,
                        (refundedQuantities.get(refundItem.productId) || 0) + refundItem.quantity
                    );
                });

                items.forEach((item) => {
                    // Get refunded quantity for this product
                    const refundedQty = refundedQuantities.get(item.productId) || 0;
                    // Calculate actual quantity sold (original - refunded)
                    const actualQuantity = item.quantity - refundedQty;
                    
                    if (actualQuantity <= 0) return; // Skip if all items were refunded

                    const totalSales = actualQuantity * item.productSellPrice;
                    const totalCost = actualQuantity * item.productBuyPrice;

                    const existing = itemMap.get(item.productId);
                    if (existing) {
                        existing.quantity += actualQuantity;
                        existing.totalSales += totalSales;
                        existing.profit += totalSales - totalCost;
                    } else {
                        itemMap.set(item.productId, {
                            id: item.productId,
                            name: item.productName,
                            quantity: actualQuantity,
                            totalSales: totalSales,
                            buyPrice: item.productBuyPrice,
                            sellPrice: item.productSellPrice,
                            profit: totalSales - totalCost,
                        });
                    }
                });
            } catch (error) {
                console.error("Error parsing transaction items:", error);
            }
        });

        return Array.from(itemMap.values()).sort(
            (a, b) => b.totalSales - a.totalSales
        );
    }, [filteredTransactions]);

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

    if (!userId) {
        return <div>Please sign in to view the dashboard</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <div className="flex gap-4">
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
                    <Button
                        onClick={() => router.push("/qr")}
                        className="flex items-center gap-2"
                    >
                        <QrCode className="h-4 w-4" />
                        Show QR Code
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Transactions
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {metrics.totalTransactions}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {dateRangeLabel}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Revenue
                        </CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            PHP{metrics.totalSales.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {dateRangeLabel}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Cost
                        </CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            PHP{metrics.totalCost.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {dateRangeLabel}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Margin
                        </CardTitle>
                        <PiggyBank className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            PHP{metrics.margin.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {metrics.marginPercentage.toFixed(1)}% margin
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Products
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {itemsSold.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {dateRangeLabel}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-red-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-500">
                            Expired Products
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">
                            {expiredProducts.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Need attention
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {monthlyData.length > 0 ? (
                            <AreaChart
                                data={monthlyData}
                                index="date"
                                categories={["Total Sales"]}
                                colors={["blue"]}
                                yAxisWidth={60}
                                showAnimation
                                className="h-72"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-72 text-muted-foreground">
                                No data available for this period
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Yearly Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {yearlyData.length > 0 ? (
                            <BarChart
                                data={yearlyData}
                                index="year"
                                categories={["Total Sales"]}
                                colors={["blue"]}
                                yAxisWidth={60}
                                showAnimation
                                className="h-72"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-72 text-muted-foreground">
                                No data available for this period
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Expired Products Table */}
            {expiredProducts.length > 0 && (
                <Card className="border-red-200">
                    <CardHeader className="border-b border-red-100">
                        <CardTitle className="text-red-500 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Expired Products
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Expiration Date</TableHead>
                                        <TableHead>Days Expired</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {expiredProducts.map((product) => {
                                        const expirationDate = new Date(
                                            product.expirationDate!
                                        );
                                        const today = new Date();
                                        const daysExpired = Math.floor(
                                            (today.getTime() -
                                                expirationDate.getTime()) /
                                                (1000 * 60 * 60 * 24)
                                        );

                                        return (
                                            <TableRow key={product.id}>
                                                <TableCell>
                                                    {product.code}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {product.name}
                                                </TableCell>
                                                <TableCell>
                                                    {product.stock}
                                                </TableCell>
                                                <TableCell className="text-red-500">
                                                    {format(
                                                        expirationDate,
                                                        "MMM dd, yyyy"
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-red-500">
                                                    {daysExpired}{" "}
                                                    {daysExpired === 1
                                                        ? "day"
                                                        : "days"}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Items Sold Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Items Sold</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">
                                        Quantity
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Unit Price
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Total Sales
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Profit
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {itemsSold.length > 0 ? (
                                    itemsSold.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">
                                                {item.name}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {item.quantity.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                PHP {item.sellPrice.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                PHP {item.totalSales.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                PHP {item.profit.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center py-4"
                                        >
                                            No items sold during this period
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
