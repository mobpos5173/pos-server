import { headers } from "next/headers";

export async function getCurrentUserId() {
    // Get userId from either Clerk's auth or the custom header set in middleware
    const headersList = await headers();
    return headersList.get("x-clerk-user-id") || "";
}