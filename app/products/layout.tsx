import { AuthCheck } from "@/components/auth/auth-check";
import Navbar from "@/components/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthCheck>
            <SidebarProvider>
                <AppSidebar />
                <main className="flex-grow">
                    <Navbar />
                    {children}
                </main>
            </SidebarProvider>
        </AuthCheck>
    );
}
