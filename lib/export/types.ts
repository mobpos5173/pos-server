export type DateRange =
    | "daily"
    | "yesterday"
    | "week"
    | "month"
    | "3months"
    | "annual";

export type ExportType = "transactions" | "products";

export type TransactionItem = {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    productSellPrice: number;
    productBuyPrice: number;
};

export type ExportTransaction = {
    id: number;
    dateOfTransaction: string;
    totalPrice: number;
    paymentMethodId: string;
    status: string;
    cashReceived?: number;
    emailTo?: string;
    clerkId?: string;
    items?: TransactionItem[];
};
