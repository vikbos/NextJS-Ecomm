import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import Link from "next/link";
import { Category } from "@/generated/prisma/client";

export function MobileNav({ categories }: { categories: Category[] }) {
    return (
        <Sheet>
            <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                    <Menu className="w-5 h-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle>
                        Menu
                    </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col mt-4 gap-4 p-4">
                    <SheetClose asChild>
                        <Link href="/">Home</Link>
                    </SheetClose>
                    <SheetClose asChild>
                        <Link href="/products">Products</Link>
                    </SheetClose>

                    <div>
                        <h3 className="text-xs font-medium mb-2 text-muted-foreground">Categories</h3>
                        {categories.map((category) => (
                            <SheetClose asChild key={category.id}>
                                <Link
                                    href={`/search/${category.slug}`}
                                    className="block py-2 text-sm font-medium"
                                >
                                    {category.name}
                                </Link>
                            </SheetClose>
                        ))}
                    </div>
                </nav>
            </SheetContent>
        </Sheet>
    )
}