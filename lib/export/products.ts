import {
    DateRange,
    ProductSalesSummary,
    Transaction,
    TransactionItem,
} from "@/types";
import { filterTransactionsByDate } from "./date-filters";
import * as XLSX from "xlsx";
import { format } from "date-fns";

export const calculateProductSales = (transactions: Transaction[]) => {
    const productSales = new Map<number, ProductSalesSummary>();

    transactions.forEach((transaction) => {
        const items = JSON.parse(transaction.items);
        items?.forEach((item: TransactionItem) => {
            const existing = productSales.get(item.productId);
            if (existing) {
                existing.totalQuantity += item.quantity;
                existing.totalBuyAmount += item.quantity * item.productBuyPrice;
                existing.totalSellAmount +=
                    item.quantity * item.productSellPrice;
                existing.profit =
                    existing.totalSellAmount - existing.totalBuyAmount;
                existing.profitMargin =
                    (existing.profit / existing.totalSellAmount) * 100;
            } else {
                const totalBuyAmount = item.quantity * item.productBuyPrice;
                const totalSellAmount = item.quantity * item.productSellPrice;
                const profit = totalSellAmount - totalBuyAmount;
                productSales.set(item.productId, {
                    productId: item.productId,
                    name: item.productName,
                    buyPrice: item.productBuyPrice,
                    sellPrice: item.productSellPrice,
                    totalQuantity: item.quantity,
                    totalBuyAmount,
                    totalSellAmount,
                    profit,
                    profitMargin: (profit / totalSellAmount) * 100,
                });
            }
        });
    });

    return Array.from(productSales.values());
};

export const exportProducts = async (
    transactions: Transaction[],
    range: DateRange
) => {
    const filteredTransactions = filterTransactionsByDate(transactions, range);
    const productSales = calculateProductSales(filteredTransactions);

    const data = productSales.map((product) => ({
        "Product ID": product.productId,
        "Product Name": product.name,
        "Product Buy Price": product.buyPrice,
        "Product Sell Price": product.sellPrice,
        "Total Quantity Sold": product.totalQuantity,
        "Total Buy Amount": `PHP ${product.totalBuyAmount.toFixed(2)}`,
        "Total Sell Amount": `PHP ${product.totalSellAmount.toFixed(2)}`,
        Profit: `PHP ${product.profit.toFixed(2)}`,
        "Profit Margin": `${product.profitMargin.toFixed(1)}%`,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    const totalQuantity = productSales.reduce(
        (acc, product) => acc + product.totalQuantity,
        0
    );
    const totalBuyAmount = productSales.reduce(
        (acc, product) => acc + product.totalBuyAmount,
        0
    );
    const totalSellAmount = productSales.reduce(
        (acc, product) => acc + product.totalSellAmount,
        0
    );
    const totalProfit = totalSellAmount - totalBuyAmount;
    const overallMargin = (totalProfit / totalSellAmount) * 100;

    XLSX.utils.sheet_add_aoa(
        ws,
        [
            [""],
            ["Summary"],
            ["Total Products Sold", totalQuantity],
            ["Total Buy Amount", `PHP ${totalBuyAmount.toFixed(2)}`],
            ["Total Sell Amount", `PHP ${totalSellAmount.toFixed(2)}`],
            ["Total Profit", `PHP ${totalProfit.toFixed(2)}`],
            ["Overall Profit Margin", `${overallMargin.toFixed(1)}%`],
        ],
        { origin: -1 }
    );

    XLSX.utils.book_append_sheet(wb, ws, "Products");

    const fileName = `products_${range}_${format(
        new Date(),
        "yyyy-MM-dd"
    )}.xlsx`;
    XLSX.writeFile(wb, fileName);
};
