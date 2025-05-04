"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { TableLoading } from "@/components/ui/table-loading";
import { UnitMeasurementForm } from "@/components/settings/UnitMeasurementForm";
import { PaymentMethodForm } from "@/components/settings/PaymentMethodForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePaymentMethods } from "@/hooks/use-payments";
import { useUnitMeasurements } from "@/hooks/use-unit-measurements";
import { PaymentMethod, UnitMeasurement } from "@/types";
import { Pencil, Trash2, Eye } from "lucide-react";
import { PaymentMethodViewDialog } from "@/components/settings/PaymentMethodViewDialog";
import { UnitMeasurementViewDialog } from "@/components/settings/UnitMeasurementViewDialog";

export default function SettingsPage() {
    const { userId } = useAuth();
    const [activeTab, setActiveTab] = useState("unit-measurements");
    const [openUnitMeasurementDialog, setOpenUnitMeasurementDialog] =
        useState(false);
    const [openPaymentMethodDialog, setOpenPaymentMethodDialog] =
        useState(false);
    const [editingPaymentMethod, setEditingPaymentMethod] =
        useState<PaymentMethod | null>(null);
    const [editingUnitMeasurement, setEditingUnitMeasurement] =
        useState<UnitMeasurement | null>(null);
    const [viewingPaymentMethod, setViewingPaymentMethod] =
        useState<PaymentMethod | null>(null);
    const [viewingUnitMeasurement, setViewingUnitMeasurement] =
        useState<UnitMeasurement | null>(null);
    const {
        paymentMethods,
        loading: loadingPayments,
        error: paymentError,
        refreshPaymentMethods,
    } = usePaymentMethods();
    const {
        // unitMeasurements,
        // loading: loadingUnits,
        error: unitError,
        refreshUnitMeasurements,
    } = useUnitMeasurements();
    const [isActionLoading, setIsActionLoading] = useState(false);

    const handleEditPaymentMethod = (method: any) => {
        setEditingPaymentMethod(method);
        setOpenPaymentMethodDialog(true);
    };

    // const handleEditUnitMeasurement = (unit: UnitMeasurement) => {
    //     setEditingUnitMeasurement(unit);
    //     setOpenUnitMeasurementDialog(true);
    // };

    const handleViewPaymentMethod = (method: any) => {
        setViewingPaymentMethod(method);
    };

    // const handleViewUnitMeasurement = (unit: UnitMeasurement) => {
    //     setViewingUnitMeasurement(unit);
    // };

    const handleDeletePaymentMethod = async (id: number) => {
        if (confirm("Are you sure you want to delete this payment method?")) {
            try {
                setIsActionLoading(true);
                const response = await fetch(
                    `/api/settings/payment-methods/${id}`,
                    {
                        method: "DELETE",
                    }
                );
                if (!response.ok)
                    throw new Error("Failed to delete payment method");
                refreshPaymentMethods();
            } catch (error) {
                console.error("Error deleting payment method:", error);
            } finally {
                setIsActionLoading(false);
            }
        }
    };

    // const handleDeleteUnitMeasurement = async (id: number) => {
    //     if (confirm("Are you sure you want to delete this unit measurement?")) {
    //         try {
    //             setIsActionLoading(true);
    //             const response = await fetch(
    //                 `/api/settings/unit-measurements/${id}`,
    //                 {
    //                     method: "DELETE",
    //                 }
    //             );
    //             if (!response.ok)
    //                 throw new Error("Failed to delete unit measurement");
    //             refreshUnitMeasurements();
    //         } catch (error) {
    //             console.error("Error deleting unit measurement:", error);
    //         } finally {
    //             setIsActionLoading(false);
    //         }
    //     }
    // };

    if (!userId) {
        return <div>Please sign in to view settings</div>;
    }

    if (paymentError || unitError) {
        return <div>Error: {paymentError || unitError}</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Settings</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    {/* <TabsTrigger value="unit-measurements">
                        Unit Measurements
                    </TabsTrigger> */}
                    <TabsTrigger value="payment-methods">
                        Payment Methods
                    </TabsTrigger>
                </TabsList>

                {/* <TabsContent value="unit-measurements" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">
                            Unit Measurements
                        </h2>
                        <Button
                            onClick={() => {
                                setEditingUnitMeasurement(null);
                                setOpenUnitMeasurementDialog(true);
                            }}
                            disabled={isActionLoading}
                        >
                            Add Unit Measurement
                        </Button>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="w-[100px]">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingUnits || isActionLoading ? (
                                    <TableLoading columns={3} />
                                ) : unitMeasurements.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            className="text-center py-4"
                                        >
                                            No unit measurements found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    unitMeasurements.map((unit) => (
                                        <TableRow key={unit.id}>
                                            <TableCell>{unit.name}</TableCell>
                                            <TableCell>
                                                {unit.description}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleViewUnitMeasurement(
                                                                unit
                                                            )
                                                        }
                                                        disabled={
                                                            isActionLoading
                                                        }
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleEditUnitMeasurement(
                                                                unit
                                                            )
                                                        }
                                                        disabled={
                                                            isActionLoading
                                                        }
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleDeleteUnitMeasurement(
                                                                unit.id
                                                            )
                                                        }
                                                        disabled={
                                                            isActionLoading
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent> */}

                <TabsContent value="payment-methods" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">
                            Payment Methods
                        </h2>
                        <Button
                            onClick={() => {
                                setEditingPaymentMethod(null);
                                setOpenPaymentMethodDialog(true);
                            }}
                            disabled={isActionLoading}
                        >
                            Add Payment Method
                        </Button>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="w-[100px]">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingPayments || isActionLoading ? (
                                    <TableLoading columns={2} />
                                ) : paymentMethods.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={2}
                                            className="text-center py-4"
                                        >
                                            No payment methods found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paymentMethods.map((method) => (
                                        <TableRow key={method.id}>
                                            <TableCell>{method.name}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleViewPaymentMethod(
                                                                method
                                                            )
                                                        }
                                                        disabled={
                                                            isActionLoading
                                                        }
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleEditPaymentMethod(
                                                                method
                                                            )
                                                        }
                                                        disabled={
                                                            isActionLoading
                                                        }
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleDeletePaymentMethod(
                                                                method.id
                                                            )
                                                        }
                                                        disabled={
                                                            isActionLoading
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>

            <UnitMeasurementForm
                open={openUnitMeasurementDialog}
                onOpenChange={setOpenUnitMeasurementDialog}
                onSubmit={async (data) => {
                    try {
                        setIsActionLoading(true);
                        const url = editingUnitMeasurement
                            ? `/api/settings/unit-measurements/${editingUnitMeasurement.id}`
                            : "/api/settings/unit-measurements";
                        const method = editingUnitMeasurement ? "PUT" : "POST";

                        const response = await fetch(url, {
                            method,
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(data),
                        });
                        if (!response.ok)
                            throw new Error(
                                `Failed to ${
                                    editingUnitMeasurement ? "update" : "create"
                                } unit measurement`
                            );
                        setOpenUnitMeasurementDialog(false);
                        setEditingUnitMeasurement(null);
                        refreshUnitMeasurements();
                    } catch (error) {
                        console.error("Error saving unit measurement:", error);
                    } finally {
                        setIsActionLoading(false);
                    }
                }}
                mode={editingUnitMeasurement ? "edit" : "create"}
                initialData={editingUnitMeasurement}
                isLoading={isActionLoading}
            />

            <PaymentMethodForm
                open={openPaymentMethodDialog}
                onOpenChange={setOpenPaymentMethodDialog}
                onSubmit={async (data) => {
                    try {
                        setIsActionLoading(true);
                        const url = editingPaymentMethod
                            ? `/api/settings/payment-methods/${editingPaymentMethod.id}`
                            : "/api/settings/payment-methods";
                        const method = editingPaymentMethod ? "PUT" : "POST";

                        const response = await fetch(url, {
                            method,
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(data),
                        });
                        if (!response.ok)
                            throw new Error(
                                `Failed to ${
                                    editingPaymentMethod ? "update" : "create"
                                } payment method`
                            );
                        setOpenPaymentMethodDialog(false);
                        setEditingPaymentMethod(null);
                        refreshPaymentMethods();
                    } catch (error) {
                        console.error("Error saving payment method:", error);
                    } finally {
                        setIsActionLoading(false);
                    }
                }}
                mode={editingPaymentMethod ? "edit" : "create"}
                initialData={editingPaymentMethod}
                isLoading={isActionLoading}
            />

            {viewingPaymentMethod && (
                <PaymentMethodViewDialog
                    open={!!viewingPaymentMethod}
                    onOpenChange={(open) =>
                        !open && setViewingPaymentMethod(null)
                    }
                    paymentMethod={viewingPaymentMethod}
                />
            )}

            {viewingUnitMeasurement && (
                <UnitMeasurementViewDialog
                    open={!!viewingUnitMeasurement}
                    onOpenChange={(open) =>
                        !open && setViewingUnitMeasurement(null)
                    }
                    unitMeasurement={viewingUnitMeasurement}
                />
            )}
        </div>
    );
}
