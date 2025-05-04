import { useCallback, useEffect, useState } from "react";
import { PaymentMethod } from "@/types";

export function usePaymentMethods() {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPaymentMethods = useCallback(async () => {
        try {
            const response = await fetch("/api/settings/payment-methods");
            if (!response.ok)
                throw new Error("Failed to fetch payment methods");
            const data = await response.json();
            setPaymentMethods(data);
            setError(null);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch payment methods"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const createPaymentMethod = useCallback(
        async (data: Omit<PaymentMethod, "id" | "clerkId">) => {
            try {
                const response = await fetch("/api/settings/payment-methods", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                if (!response.ok)
                    throw new Error("Failed to create payment method");
                await fetchPaymentMethods();
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to create payment method"
                );
                throw err;
            }
        },
        [fetchPaymentMethods]
    );

    const updatePaymentMethod = useCallback(
        async (id: number, data: Omit<PaymentMethod, "id" | "clerkId">) => {
            try {
                const response = await fetch(
                    `/api/settings/payment-methods/${id}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data),
                    }
                );
                if (!response.ok)
                    throw new Error("Failed to update payment method");
                await fetchPaymentMethods();
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to update payment method"
                );
                throw err;
            }
        },
        [fetchPaymentMethods]
    );

    const deletePaymentMethod = useCallback(
        async (id: number) => {
            try {
                const response = await fetch(
                    `/api/settings/payment-methods/${id}`,
                    {
                        method: "DELETE",
                    }
                );
                if (!response.ok)
                    throw new Error("Failed to delete payment method");
                await fetchPaymentMethods();
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to delete payment method"
                );
                throw err;
            }
        },
        [fetchPaymentMethods]
    );

    useEffect(() => {
        fetchPaymentMethods();
    }, [fetchPaymentMethods]);

    return {
        paymentMethods,
        loading,
        error,
        createPaymentMethod,
        updatePaymentMethod,
        deletePaymentMethod,
        refreshPaymentMethods: fetchPaymentMethods,
    };
}
