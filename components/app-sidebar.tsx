import {
    Settings,
    LaptopMinimal,
    ScanBarcode,
    ShoppingCart,
    FolderTree,
    SquareChartGantt,
} from "lucide-react";

import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LaptopMinimal,
    },
    {
        title: "Products",
        url: "/products",
        icon: ScanBarcode,
    },
    {
        title: "Inventory",
        url: "/inventory",
        icon: SquareChartGantt,
    },
    {
        title: "Categories",
        url: "/categories",
        icon: FolderTree,
    },
    {
        title: "Transactions",
        url: "/transactions",
        icon: ShoppingCart,
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
    },
];

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarHeader>POS System</SidebarHeader>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
