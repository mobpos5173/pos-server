import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const files = sqliteTable("files", {
    id: text("id").primaryKey(),
    filename: text("filename"),
    filepath: text("filepath"),
    mimetype: text("mimetype"),
    clerkId: text("clerk_id").notNull(),
});

export const payments = sqliteTable("payments", {
    id: integer("id").primaryKey(),
    name: text("name"),
    clerkId: text("clerk_id").notNull(),
    deleted: text("deleted"),
});

export const users = sqliteTable("users", {
    id: integer("id").primaryKey(),
    clerkId: text("clerk_id").notNull().unique(),
    name: text("name"),
    email: text("email"),
    password: text("password"),
    token: text("token"),
    profilePicture: text("profile_picture").references(() => files.id),
});

export const contactTypes = sqliteTable("contacts_types", {
    id: integer("id").primaryKey(),
    name: text("name"),
    clerkId: text("clerk_id").notNull(),
});

export const userContacts = sqliteTable("user_contacts", {
    id: integer("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    contactId: integer("contact_id"),
    clerkId: text("clerk_id").notNull(),
});

export const settings = sqliteTable("settings", {
    id: integer("id").primaryKey(),
    name: text("name"),
    clerkId: text("clerk_id").notNull(),
});

export const userSettings = sqliteTable("user_settings", {
    id: integer("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    settingsId: integer("settings_id").references(() => settings.id),
    clerkId: text("clerk_id").notNull(),
});

export const unitMeasurements = sqliteTable("unit_measurements", {
    id: integer("id").primaryKey(),
    name: text("name"),
    description: text("description"),
    clerkId: text("clerk_id").notNull(),
});

export const productCategories: any = sqliteTable("product_categories", {
    id: integer("id").primaryKey(),
    name: text("name"),
    description: text("description"),
    parentId: integer("parent_id").references(() => productCategories.id),
    clerkId: text("clerk_id").notNull(),
    deleted: text("deleted"),
});

export const products = sqliteTable("products", {
    id: integer("id").primaryKey(),
    name: text("name").notNull(),
    code: text("code").notNull(),
    description: text("description"),
    brand: text("brand"),
    image: text("image").references(() => files.id),
    imageUrl: text("image_url"),
    buyPrice: real("buy_price").notNull(),
    sellPrice: real("sell_price").notNull(),
    stock: integer("stock").notNull(),
    lowStockLevel: integer("low_stock_level"),
    expirationDate: text("expiration_date"),
    unitMeasurementsId: integer("unit_measurements_id").references(
        () => unitMeasurements.id
    ),
    unitMeasurement: text("unit_measurement"),
    categoryId: integer("category_id").references(() => productCategories.id),
    clerkId: text("clerk_id").notNull(),
    deleted: text("deleted"),
});

export const restockHistory = sqliteTable("restock_history", {
    id: integer("id").primaryKey(),
    productId: integer("product_id").references(() => products.id),
    quantity: integer("quantity").notNull(),
    previousStock: integer("previous_stock").notNull(),
    newStock: integer("new_stock").notNull(),
    previousExpirationDate: text("previous_expiration_date"),
    newExpirationDate: text("new_expiration_date"),
    dateOfRestock: text("date_of_restock").notNull(),
    notes: text("notes"),
    clerkId: text("clerk_id").notNull(),
});

export const transactions = sqliteTable("transactions", {
    id: integer("id").primaryKey(),
    paymentMethodId: integer("payment_method_id").references(() => payments.id),
    dateOfTransaction: text("date_of_transaction").notNull(),
    emailTo: text("email_to"),
    cashReceived: real("cash_received"),
    totalPrice: real("total_price").notNull(),
    status: text("status").notNull().default("active"),
    clerkId: text("clerk_id").notNull(),
    referenceNumber: text("reference_number"),
});

export const orders = sqliteTable("orders", {
    id: integer("id").primaryKey(),
    productId: integer("product_id").references(() => products.id),
    quantity: integer("quantity").notNull(),
    transactionId: integer("transaction_id").references(() => transactions.id),
    clerkId: text("clerk_id").notNull(),
    refundedQuantity: integer("refunded_quantity").default(0),
    refundStatus: text("refund_status").default("none"),
});

export const refunds = sqliteTable("refunds", {
    id: integer("id").primaryKey(),
    transactionId: integer("transaction_id").references(() => transactions.id),
    dateOfRefund: text("date_of_refund").notNull(),
    totalAmount: real("total_amount").notNull(),
    reason: text("reason"),
    type: text("type").notNull(),
    clerkId: text("clerk_id").notNull(),
});

export const refundItems = sqliteTable("refund_items", {
    id: integer("id").primaryKey(),
    refundId: integer("refund_id").references(() => refunds.id),
    orderId: integer("order_id").references(() => orders.id),
    productId: integer("product_id").references(() => products.id),
    quantity: integer("quantity").notNull(),
    amount: real("amount").notNull(),
    clerkId: text("clerk_id").notNull(),
});

export const transactionsHistory = sqliteTable("transactions_history", {
    id: integer("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    transactionId: integer("transaction_id").references(() => transactions.id),
    clerkId: text("clerk_id").notNull(),
});
