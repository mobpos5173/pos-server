import { initialSetup } from "./00-initial-setup";
import { contactsAndSettings } from "./01-contacts-and-settings";
import { productsSetup } from "./02-products-setup";
import { transactionsSetup } from "./03-transactions-setup";
import { addClerkId } from "./04-add-clerk-id";
import { addDeletedColumn } from "./05-add-deleted-column";
import { addCategoryIdToProducts } from "./06-add-category-id";
import { addRefundTables } from "./07-add-refund-tables";
import { addReferenceNumberToTransactions } from "./08-add-reference-number";
import { addRestockTable } from "./09-add-restock-table";
import { addImageUrlToProducts } from "./10.add-image-url-column";
import { addUnitMeasurementString } from "./11-add-unit-measurement-string";
import { addCategoryParentId } from "./12-add-category-parent-id";
import { addBrandToProducts } from "./13-add-brand-to-products";

export async function runMigrations() {
    try {
        console.log("Running migrations...");

        await initialSetup();
        console.log("✓ Initial setup complete");

        await contactsAndSettings();
        console.log("✓ Contacts and settings tables created");

        await productsSetup();
        console.log("✓ Products tables created");

        await transactionsSetup();
        console.log("✓ Transactions tables created");

        await addClerkId();
        console.log("✓ Added Clerk ID support");

        await addDeletedColumn();
        console.log("✓ Added deleted column");

        await addCategoryIdToProducts();
        console.log("✓ Added category_id to products table");

        await addRefundTables();
        console.log("✓ Added refund tables");

        await addReferenceNumberToTransactions();
        console.log("✓ Added reference_number to transactions table");

        await addRestockTable();
        console.log("✓ Added restock_history table");

        await addImageUrlToProducts();
        console.log("✓ Added image_url to products table");

        await addUnitMeasurementString();
        console.log("✓ Added unit_measurement string to products table");

        await addCategoryParentId();
        console.log("✓ Added parent_id to categories table");

        await addBrandToProducts();
        console.log("✓ Added brand to products table");

        console.log("All migrations completed successfully");
    } catch (error) {
        console.error("Migration failed:", error);
        throw error;
    }
}
