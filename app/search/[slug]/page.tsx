// results from breadcrumbs / navbar category links page
import { Breadcrumbs } from "@/components/breadcrumbs";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import ProductsSkeleton from "../../ProductsSkeleton";
import { notFound } from "next/navigation";
import { ProductListServerWrapper } from "@/components/ProductListServerWrapper";

type CategoryPageProps = {
    params: Promise<{slug: string}>
    searchParams: Promise<{sort?: string}>
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
    const { slug } = await params;
    const { sort } = await searchParams;

    const category = await prisma.category.findUnique({
      where: { slug },
      select: { name: true, slug: true },
    })

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