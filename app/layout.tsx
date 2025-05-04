import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
// import Navbar from "@/components/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
// import { AppSidebar } from "@/components/app-sidebar";

// const geistSans = Geist({
//     variable: "--font-geist-sans",
//     subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//     variable: "--font-geist-mono",
//     subsets: ["latin"],
// });

export const metadata: Metadata = {
    title: "POS System",
    description: "Modern POS System with Next.js",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body>
                    <SidebarProvider>
                        {/* <AppSidebar /> */}
                        <main className="flex-grow">
                            {/* <Navbar /> */}
                            {children}
                        </main>
                    </SidebarProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
