import { CategorySidebar } from "@/components/category-sidebar";
import { SortingControls } from "@/components/sorting-controls";
import { getCachedCategories } from "@/lib/actions";
import { Suspense } from "react";

async function CategorySidebarServerWrapper() {
    const categories = await getCachedCategories();

    return <CategorySidebar categories={categories} />;
}

export default async function SearchLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="container mx-auto py-4">
            <div className="flex gap-8">
                <div className="w-[125px] flex-none">
                    <Suspense fallback={<div className="w-[125px]">Loading...</div>}>
                        <CategorySidebarServerWrapper />
                    </Suspense>
                </div>
                <div className="flex-1">
                    {children}
                </div>
                <div className="w-[125px] flex-none">
                    <SortingControls />
                </div>
            </div>
        </main>
    )
}