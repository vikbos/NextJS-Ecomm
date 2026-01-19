// results from breadcrumbs / navbar category links page
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Suspense } from "react";
import ProductsSkeleton from "../../ProductsSkeleton";
import { notFound } from "next/navigation";
import { ProductListServerWrapper } from "@/components/ProductListServerWrapper";
import { getCategoryBySlugCached } from "@/lib/actions";

type CategoryPageProps = {
    params: Promise<{slug: string}>
    searchParams: Promise<{sort?: string}>
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params

    const category = await getCategoryBySlugCached(slug);

    if (!category) {
        return {}
    }

    return {
        title: category.name,
        openGraph: {
            title: category.name,
        },
    }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
    const { slug } = await params;
    const { sort } = await searchParams;

    const category = await getCategoryBySlugCached(slug);

    if (!category) {
      notFound()
    }

    const breadcrumbs = [
        { label: 'Products', href: '/' },
        { label: category.name, href: `/search/${category.slug}` },
    ];
    return (
        <>

            <Breadcrumbs items={breadcrumbs} />

            <Suspense key={`${slug}-${sort}`} fallback={<ProductsSkeleton />}>
                <ProductListServerWrapper params={{ slug, sort }} />
            </Suspense>

        </>
    )
}   