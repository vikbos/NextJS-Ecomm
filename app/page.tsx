import { prisma } from "@/lib/prisma";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Suspense } from "react";
import ProductsSkeleton from "./ProductsSkeleton";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductListServerWrapper } from "@/components/ProductListServerWrapper";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

const pageSize = 3;

export default async function HomePage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;

  const totalProducts = await prisma.product.count();
  const totalPages = Math.ceil(totalProducts / pageSize);

  return (
    <main className="container mx-auto py-4">
      <Breadcrumbs items={[{ label: 'Products', href: '/'}]}/>

      <Suspense key={page} fallback={<ProductsSkeleton />}>
        <ProductListServerWrapper params={{ page, pageSize}} />
      </Suspense>

      <Pagination className="mt-8">
        <PaginationContent>

          <PaginationItem>
            <PaginationPrevious href={`?page=${page - 1}`} />
          </PaginationItem>

          {Array.from({ length: totalPages }).map((_, index) => (
            <PaginationItem key={index}>
              <PaginationLink
                href={`?page=${index + 1}`}
                isActive={page === index + 1}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          

          <PaginationItem>
            <PaginationNext href={`?page=${page + 1}`} />
          </PaginationItem>

        </PaginationContent>
      </Pagination>
    </main>
  );
}
