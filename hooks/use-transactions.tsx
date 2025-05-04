import { useCallback, useEffect, useState } from "react";
import { Transaction, Order } from "@/types";

// interface Transaction {
//     id: number;
//     paymentMethodId: number;
//     dateOfTransaction: string;
//     emailTo: string | null;
//     cashReceived: number | null;
//     totalPrice: number;
//     status: string;
// }

// interface Order {
//     productId: number;
//     quantity: number;
//     price: number;
// }

export function useTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = useCallback(async () => {
        try {
            const response = await fetch("/api/transactions");
            if (!response.ok) {
                throw new Error("Failed to fetch transactions");
            }
            const data = await response.json();
            setTransactions(data);
            setError(null);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch transactions"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const createTransaction = useCallback(
        async (transaction: Omit<Transaction, "id">, orders: Order[]) => {
            try {
                const response = await fetch("/api/transactions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ ...transaction, items: orders }),
                });
                if (!response.ok) {
                    throw new Error("Failed to create transaction");
                }
                await fetchTransactions();
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to create transaction"
                );
            }
        },
        [fetchTransactions]
    );

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    return {
        transactions,
        loading,
        error,
        createTransaction,
        refreshTransactions: fetchTransactions,
    };
}
