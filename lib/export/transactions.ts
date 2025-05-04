import { DateRange, Transaction } from "@/types";
import { format } from "date-fns";
import { filterTransactionsByDate } from "./date-filters";
import * as XLSX from "xlsx";

const formatCurrency = (amount: number): string => {
    return `PHP ${amount.toFixed(2)}`;
};

const calculateProfitMargin = (netAmount: number, cost: number): string => {
    if (netAmount <= 0 || cost < 0) return "N/A";

    const margin = ((netAmount - cost) / netAmount) * 100;
    if (isNaN(margin) || !isFinite(margin)) return "N/A";

    return `${margin.toFixed(1)}%`;
};

export const exportTransactions = async (
    transactions: Transaction[],
    range: DateRange
) => {
    const filteredTransactions = filterTransactionsByDate(transactions, range);

    const data = filteredTransactions.map((transaction) => {
        const netAmount = Math.max(
            0,
            transaction.totalPrice - (transaction.totalRefund || 0)
        );
        const cost = Math.max(0, transaction.totalCost || 0);
        const profit = Math.max(0, netAmount - cost);

        return {
            "Transaction ID": transaction.id,
            Date: format(
                new Date(transaction.dateOfTransaction),
                "MM/dd/yyyy HH:mm:ss"
            ),
            "Total Amount": formatCurrency(transaction.totalPrice),
            "Payment Method": transaction.paymentMethodName,
            Status: transaction.status,
            "Cash Received": transaction.cashReceived
                ? formatCurrency(transaction.cashReceived)
                : "-",
            "Total Refund":
                transaction.totalRefund > 0
                    ? formatCurrency(transaction.totalRefund)
                    : "-",
            "Net Amount": formatCurrency(netAmount),
            Cost: formatCurrency(cost),
            Profit: formatCurrency(profit),
            "Profit Margin": calculateProfitMargin(netAmount, cost),
            "Refund Reason": transaction.refundReasons || "-",
        };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Calculate summary with safety checks
    const totalAmount = Math.max(
        0,
        filteredTransactions.reduce((sum, t) => sum + t.totalPrice, 0)
    );
    const totalRefunds = Math.max(
        0,
        filteredTransactions.reduce((sum, t) => sum + (t.totalRefund || 0), 0)
    );
    const totalCost = Math.max(
        0,
        filteredTransactions.reduce((sum, t) => sum + (t.totalCost || 0), 0)
    );
    const netAmount = Math.max(0, totalAmount - totalRefunds);
    const totalProfit = Math.max(0, netAmount - totalCost);

    // Add summary information
    XLSX.utils.sheet_add_aoa(
        ws,
        [
            [""],
            ["Summary"],
            ["Total Transactions", filteredTransactions.length],
            ["Total Amount", formatCurrency(totalAmount)],
            ["Total Refunds", formatCurrency(totalRefunds)],
            ["Net Amount", formatCurrency(netAmount)],
            ["Total Cost", formatCurrency(totalCost)],
            ["Total Profit", formatCurrency(totalProfit)],
            [
                "Overall Profit Margin",
                calculateProfitMargin(netAmount, totalCost),
            ],
        ],
        { origin: -1 }
    );

    XLSX.utils.book_append_sheet(wb, ws, "Transactions");

    const fileName = `transactions_${range}_${format(
        new Date(),
        "yyyy-MM-dd"
    )}.xlsx`;
    XLSX.writeFile(wb, fileName);
};
