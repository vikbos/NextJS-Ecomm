"use server";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "./prisma";

export interface GetProductParams {
  query?: string;
  sort?: string;
  slug?: string;
  page?: number
  pageSize?: number
}
export async function getProducts({
  query, sort, slug, page = 1, pageSize = 18
}: GetProductParams) {
  const where: Prisma.ProductWhereInput = {};

  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ];
  }

  if (slug) {
    where.category = { slug };
  }
  let orderBy: Record<string, 'asc' | 'desc'> | undefined = undefined;
  
  if (sort === 'price-asc') {
    orderBy = { price: 'asc' };
  } else if (sort === 'price-desc') {
    orderBy = { price: 'desc' };
  }

  const skip = pageSize ? (page - 1) * pageSize : undefined;
  const take = pageSize;

  return await prisma.product.findMany({
    where,
    orderBy,
    skip,
    take,
  });
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product) return null

  return product;
}