// import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Navbar() {
    return (
        <nav className="bg-white shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* <div className="flex space-x-4">
                        <Link
                            href="/"
                            className="text-gray-900 hover:text-gray-700"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/products"
                            className="text-gray-900 hover:text-gray-700"
                        >
                            Products
                        </Link>
                        <Link
                            href="/transactions"
                            className="text-gray-900 hover:text-gray-700"
                        >
                            Transactions
                        </Link>
                    </div> */}
                    <SidebarTrigger />
                    <SignedOut>
                        <SignInButton />
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </div>
            </div>
        </nav>
    );
}
