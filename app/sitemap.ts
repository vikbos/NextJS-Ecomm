import { prisma } from "@/lib/prisma"

export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_URL
    const products = await prisma.product.findMany({
        select: {
            slug: true
        }
    })
    const categories = await prisma.category.findMany({
        select: {
            slug: true
        }
    })
    return [
        {
            url: `${baseUrl}/`,
            lastModified: new Date(),
        },
        ...products.map((prod) => ({
            url: `${baseUrl}/product/${prod.slug}`,
            lastModified: new Date(),
        })),
        ...categories.map((cat) => ({
            url: `${baseUrl}/search/${cat.slug}`,
            lastModified: new Date(),
        })),
    ]
}