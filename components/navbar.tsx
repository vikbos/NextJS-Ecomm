import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { MobileNav } from "./mobile-nav";
import { SearchInput } from "./search-input";
import { CartIndicator } from "./cart-indicator";
import AuthStatus from "./auth-status";
import { getCachedCategories } from "@/lib/actions";

export async function Navbar() {
    const categories = await getCachedCategories()

    return (
        <div className="border-b">
            <div className="container mx-auto flex h-16 items-center justify-between">
                <div>
                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-2xl font-bold hidden md:block">
                            Store
                        </Link>
                        <nav className="hidden md:flex items-center gap-6">
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/search/${category.slug}`}
                                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {category.name}
                                </Link>
                            ))}
                        </nav>
                        <MobileNav categories={categories} />
                    </div>
                </div>

                <div className="block w-full mx-4 md:mx-8">
                    <SearchInput />
                </div>

                <div className="flex items-center gap-0">
                    <AuthStatus />
                    <CartIndicator />
                    <ModeToggle />
                </div>
            </div>
        </div>
    )
}