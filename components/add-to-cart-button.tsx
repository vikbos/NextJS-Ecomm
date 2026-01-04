"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";
import { useTransition } from "react";
import { addToCart } from "@/lib/actions";
import { Product } from "@/generated/prisma/client";

export function AddToCartButton({ product }: { product: Product }) {
    const [isPending, startTransition] = useTransition()

    const handleAddToCart = () => {
        startTransition(async () => {
            try {
                await addToCart(product.id, 1)
            } catch (e) {
                console.error('Failed to add to cart', e)
            }
        })
    }

    return (
        <Button onClick={handleAddToCart} disabled={product.inventory === 0 || isPending} className="w-full flex justify-center items-center">
            <ShoppingCart className="mr-1 w-4 h-4" />
            {isPending ? "Adding..." : product.inventory > 0 ? 'Add to Cart' : 'Out of stock'}
        </Button>
    )
}