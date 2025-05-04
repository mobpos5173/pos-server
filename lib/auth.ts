import { NextRequest } from "next/server";

export async function validateToken(request: NextRequest) {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
        return null;
    }

    // For mobile app authentication, the token is the Clerk user ID
    return token;
}