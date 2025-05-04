import { useCallback, useEffect, useState } from "react";
import { Refund, RefundFormData } from "@/types";

export function useRefunds() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRefunds = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/refunds");
      if (!response.ok) throw new Error("Failed to fetch refunds");
      const data = await response.json();
      setRefunds(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch refunds");
    } finally {
      setLoading(false);
    }
  }, []);

  const createRefund = useCallback(
    async (data: RefundFormData) => {
      try {
        const response = await fetch("/api/refunds", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create refund");
        }

        await fetchRefunds();
        return await response.json();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create refund";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [fetchRefunds]
  );

  const getRefundableItems = useCallback(async (transactionId: number) => {
    try {
      const response = await fetch(`/api/transactions/${transactionId}/refund`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch refundable items");
      }
      return await response.json();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch refundable items";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  return {
    refunds,
    loading,
    error,
    fetchRefunds,
    createRefund,
    getRefundableItems,
  };
}
