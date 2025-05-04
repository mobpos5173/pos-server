export type DateRange =
    | "daily"
    | "yesterday"
    | "week"
    | "month"
    | "3months"
    | "annual";

export type ExportType = "transactions" | "products";

export type ProductSalesSummary = {
    productId: number;
    name: string;
    buyPrice: number;
    sellPrice: number;
    totalQuantity: number;
    totalBuyAmount: number;
    totalSellAmount: number;
    profit: number;
    profitMargin: number;
};

export type Product = {
    id: number;
    name: string;
    code: string;
    description?: string;
    brand?: string;
    image?: string;
    imageUrl?: string;
    buyPrice: number;
    sellPrice: number;
    stock: number;
    lowStockLevel?: number;
    expirationDate?: string;
    unitMeasurementsId?: number;
    unitMeasurement?: string;
    categoryId?: number;
    clerkId: string;
};

export type Category = {
    id: number;
    name: string;
    description?: string;
    parentId?: number;
    clerkId: string;
    subcategories?: Category[];
};

export type Order = {
    id: number;
    productId: number;
    quantity: number;
    price: number;
    clerkId: string;
    refundedQuantity?: number;
    refundStatus?: "none" | "partial" | "full";
};

export type TransactionItem = {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    productSellPrice: number;
    productBuyPrice: number;
    refundedQuantity?: number;
    refundStatus?: "none" | "partial" | "full";
};

export type Transaction = {
    id: number;
    dateOfTransaction: string;
    totalPrice: number;
    paymentMethodId: number;
    status: string;
    cashReceived?: number;
    emailTo?: string;
    clerkId?: string;
    items: string;
    paymentMethodName?: string;
    totalRefund: number;
    refundedItems?: string;
    refundReasons?: string;
    totalCost?: number;
};

export type ProductFormData = {
    id?: number;
    name: string;
    code: string;
    description?: string;
    brand?: string;
    image?: string;
    imageUrl?: string;
    buyPrice: number;
    sellPrice: number;
    stock: number;
    lowStockLevel?: number;
    expirationDate?: string;
    unitMeasurementsId?: number;
    unitMeasurement?: string;
    categoryId?: number;
    clerkId?: string;
};

export type UnitMeasurement = {
    id: number;
    name: string;
    description: string;
    clerkId: string;
};

export type PaymentMethod = {
    id: number;
    name: string;
    clerkId: string;
};

export type RefundType = "full" | "partial";

export type RefundItem = {
    orderId: number;
    productId: number;
    productName: string;
    originalQuantity: number;
    refundedQuantity: number;
    availableQuantity: number;
    quantityToRefund: number;
    unitPrice: number;
    totalRefund: number;
    refundStatus?: "none" | "partial" | "full";
};

export type RefundFormData = {
    transactionId: number;
    reason: string;
    type: RefundType;
    items: RefundItem[];
    totalAmount: number;
};

export type Refund = {
    id: number;
    transactionId: number;
    dateOfRefund: string;
    totalAmount: number;
    reason?: string;
    type: RefundType;
    clerkId: string;
    items?: RefundItem[];
};
