import { NextResponse } from "next/server";
import { validateToken } from "./lib/auth";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
    "/dashboard(.*)",
    "/products(.*)",
    "/transactions(.*)",
    "/api/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
    // For mobile app requests, validate the bearer token
    if (req.headers.get("authorization")) {
        const userId = await validateToken(req);
        if (!userId && isProtectedRoute(req)) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        // Add the userId to the request headers for use in API routes
        const requestHeaders = new Headers(req.headers);
        requestHeaders.set("x-clerk-user-id", userId ?? "");
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    } else {
        const { userId, redirectToSignIn } = await auth();
        if (!userId && isProtectedRoute(req)) {
            return redirectToSignIn();
        }

        if (!userId) {
            if (req.nextUrl.pathname === "/") {
                return NextResponse.redirect(new URL("/sign-in", req.url));
            }
            return redirectToSignIn();
        }

        if (req.nextUrl.pathname === "/") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        const requestHeaders = new Headers(req.headers);
        requestHeaders.set("x-clerk-user-id", userId ?? "");
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
