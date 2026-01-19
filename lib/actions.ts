"use server";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "./prisma";
import { cookies } from "next/headers";
import { revalidateTag, unstable_cache } from "next/cache";
import { createProductsCacheKey, createProductsTags } from "./cache-keys";

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

export async function getProductsCached({
  query,
  slug,
  sort,
  page = 1,
  pageSize = 18,
}: GetProductParams) {
  const cacheKey = createProductsCacheKey({
    search: query,
    categorySlug: slug,
    sort,
    page,
    limit: pageSize,
  });
  const cacheTags = createProductsTags({ search: query, categorySlug: slug });

  return unstable_cache(
    () => getProducts({ query, slug, sort, page, pageSize }),
    [cacheKey],
    {
      tags: cacheTags,
      revalidate: 3600,
    }
  )();
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product) return null

  return product;
}

export type CartWithProducts = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

export type ShoppingCart = CartWithProducts & {
  size: number;
  subtotal: number;
}

export type CartItemWithProduct = Prisma.CartItemGetPayload<{
  include: { product: true };
}>

async function findCartFromCookie(): Promise<CartWithProducts | null> {
  // nextjs server functions have access to cookies from the browser
  const cartId = (await cookies()).get('cartId')?.value;

  if (!cartId) {
    return null;
  }

  // return cached data if they are still cached or fetch new data
  return unstable_cache(async (id: string) => {
    return prisma.cart.findUnique({
      where: { id, },
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: {
            createdAt: "desc"
          }
        },
      }
    })
  }, 
  [`cart-${cartId}`],
  { tags: [`cart-${cartId}`], revalidate: 3600 }
  )(cartId); // cartId is passed as the first argument to the 1st cb function
}

export async function getCart(): Promise<ShoppingCart | null> {
  const cart = await findCartFromCookie();
  
  if (!cart) {
    return null;
  }

  return {
    ...cart,
    size: cart.items.length,
    subtotal: cart.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0),
  };
}

async function getOrCreateCart(): Promise<CartWithProducts> {
  let cart = await findCartFromCookie();

  if (cart) {
    return cart
  }

  cart = await prisma.cart.create({
    data: {},
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  (await cookies()).set('cartId', cart.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return cart;
}

export async function addToCart(productId: string, quantity: number = 1) {
  if (quantity < 1) {
    throw new Error('Quantity must be at least 1');
  }

  const cart = await getOrCreateCart();

  const existingItem = cart.items.find(item => item.productId === productId);

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
  }

  // delete cached cart -> re-render -> cache miss -> fetch fresh data -> cache again 
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  revalidateTag(`cart-${cart.id}`);
}

export async function setProductQuantity(productId: string, quantity: number) {
  if (quantity < 0) {
    throw new Error("Quantity must be at least 1")
  }

  const cart = await findCartFromCookie()

  if (!cart) {
    throw new Error("Cart not found")
  }

  // TODO: Make sure the product inventory is not exceeded

  try {
    if (quantity === 0) {
      await prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          productId,
        }
      })
    } else {
      await prisma.cartItem.updateMany({
        where: {
          cartId: cart.id,
          productId,
        },
        data: {
          quantity
        }
      })
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    revalidateTag(`cart-${cart.id}`);
  } catch (e) {
    console.log("error", e)
    throw new Error("Failed to update cart item quantity")
  }
}

export async function getProductsCountCached() {
  return unstable_cache(() => prisma.product.count(), ["products-count"], {
    tags: ["products"],
    revalidate: 3600,
  })();
}

export async function getCategoryBySlug(slug: string) {
  return await prisma.category.findUnique({
    where: { slug },
    select: { name: true, slug: true },
  });
}

export async function getCategoryBySlugCached(slug: string) {
  return unstable_cache(() => getCategoryBySlug(slug), [`category-${slug}`], {
    tags: [`category-${slug}`],
    revalidate: 3600,
  })();
}

export async function getCachedCategories() {
  return unstable_cache(
        () => {
            return prisma.category.findMany({
                select: {
                    name: true,
                    slug: true,
                    id: true
                },
                    orderBy: {
                    name: "asc",
                },
            });
        },
        ["categories"],
        {
            tags: ["categories"],
            revalidate: 3600,
        }
    )();
}
