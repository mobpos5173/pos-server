import { format } from "date-fns";
import * as XLSX from "xlsx";
import { db } from "@/lib/db";
import { products, restockHistory } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function exportRestockHistory(userId: string) {
    try {
        // Fetch restock history with product details
        const history = await db
            .select({
                id: restockHistory.id,
                productId: restockHistory.productId,
                productName: products.name,
                productCode: products.code,
                quantity: restockHistory.quantity,
                previousStock: restockHistory.previousStock,
                newStock: restockHistory.newStock,
                previousExpirationDate: restockHistory.previousExpirationDate,
                newExpirationDate: restockHistory.newExpirationDate,
                dateOfRestock: restockHistory.dateOfRestock,
                notes: restockHistory.notes,
            })
            .from(restockHistory)
            .leftJoin(products, eq(restockHistory.productId, products.id))
            .where(eq(restockHistory.clerkId, userId))
            .orderBy(restockHistory.dateOfRestock);

        // Transform data for export
        const data = history.map((record) => ({
            "Restock ID": record.id,
            "Product Code": record.productCode,
            "Product Name": record.productName,
            "Quantity Added": record.quantity,
            "Previous Stock": record.previousStock,
            "New Stock": record.newStock,
            "Previous Expiration Date": record.previousExpirationDate
                ? format(
                      new Date(record.previousExpirationDate),
                      "MMM dd, yyyy"
                  )
                : "N/A",
            "New Expiration Date": record.newExpirationDate
                ? format(new Date(record.newExpirationDate), "MMM dd, yyyy")
                : "N/A",
            "Date of Restock": format(
                new Date(record.dateOfRestock),
                "MMM dd, yyyy HH:mm:ss"
            ),
            Notes: record.notes || "",
        }));

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);

        // Add summary information
        const totalQuantity = history.reduce(
            (sum, record) => sum + record.quantity,
            0
        );
        const uniqueProducts = new Set(history.map((r) => r.productId)).size;

        console.log("Total Quantity:", totalQuantity);
        console.log("Unique Products:", uniqueProducts);
        console.log("Total Records:", history.length);
        XLSX.utils.sheet_add_aoa(
            ws,
            [
                [""],
                ["Summary"],
                ["Total Restock Records", history.length],
                ["Total Products Restocked", uniqueProducts],
                ["Total Quantity Added", totalQuantity],
            ],
            { origin: -1 }
        );

        XLSX.utils.book_append_sheet(wb, ws, "Restock History");

        // Generate filename with current date
        const fileName = `restock_history_${format(
            new Date(),
            "yyyy-MM-dd"
        )}.xlsx`;

        // Instead of writing to file, return buffer and filename
        const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

        return {
            success: true,
            buffer,
            fileName,
            contentType:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        };
    } catch (error) {
        console.error("Error exporting restock history:", error);
        throw error;
    }
}
