import { useCallback, useEffect, useState } from "react";

interface PaymentMethod {
    id: number;
    name: string;
    clerk_id: number;
}

export function usePaymentMethods() {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPaymentMethods = useCallback(async () => {
        try {
            const response = await fetch("/api/settings/payment-methods");
            if (!response.ok) {
                throw new Error("Failed to fetch payment methods");
            }
            const data = await response.json();
            setPaymentMethods(data);
            setError(null);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch payment methods"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const createPaymentMethod = useCallback(
        async (product: Omit<PaymentMethod, "id">) => {
            try {
                const response = await fetch("/api/settings/payment-methods", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(product),
                });
                if (!response.ok) {
                    throw new Error("Failed to create payment method");
                }
                await fetchPaymentMethods();
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to create product"
                );
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
        refreshPaymentMethods: fetchPaymentMethods,
    };
}
