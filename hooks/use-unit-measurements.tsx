import { useCallback, useEffect, useState } from "react";
import { UnitMeasurement } from "@/types";

export function useUnitMeasurements() {
    const [unitMeasurements, setUnitMeasurements] = useState<UnitMeasurement[]>(
        []
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUnitMeasurements = useCallback(async () => {
        try {
            const response = await fetch("/api/settings/unit-measurements");
            if (!response.ok)
                throw new Error("Failed to fetch unit measurements");
            const data = await response.json();
            setUnitMeasurements(data);
            setError(null);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch unit measurements"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const createUnitMeasurement = useCallback(
        async (data: Omit<UnitMeasurement, "id" | "clerkId">) => {
            try {
                const response = await fetch(
                    "/api/settings/unit-measurements",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data),
                    }
                );
                if (!response.ok)
                    throw new Error("Failed to create unit measurement");
                await fetchUnitMeasurements();
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to create unit measurement"
                );
                throw err;
            }
        },
        [fetchUnitMeasurements]
    );

    const updateUnitMeasurement = useCallback(
        async (id: number, data: Omit<UnitMeasurement, "id" | "clerkId">) => {
            try {
                const response = await fetch(
                    `/api/settings/unit-measurements/${id}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data),
                    }
                );
                if (!response.ok)
                    throw new Error("Failed to update unit measurement");
                await fetchUnitMeasurements();
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to update unit measurement"
                );
                throw err;
            }
        },
        [fetchUnitMeasurements]
    );

    const deleteUnitMeasurement = useCallback(
        async (id: number) => {
            try {
                const response = await fetch(
                    `/api/settings/unit-measurements/${id}`,
                    {
                        method: "DELETE",
                    }
                );
                if (!response.ok)
                    throw new Error("Failed to delete unit measurement");
                await fetchUnitMeasurements();
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to delete unit measurement"
                );
                throw err;
            }
        },
        [fetchUnitMeasurements]
    );

    useEffect(() => {
        fetchUnitMeasurements();
    }, [fetchUnitMeasurements]);

    return {
        unitMeasurements,
        loading,
        error,
        createUnitMeasurement,
        updateUnitMeasurement,
        deleteUnitMeasurement,
        refreshUnitMeasurements: fetchUnitMeasurements,
    };
}
