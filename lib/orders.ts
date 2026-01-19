"use server"

import { cookies } from "next/headers"
import { getCart } from "./actions"
import { prisma } from "./prisma"
import { createCheckoutSession, OrderWithItemsAndProduct } from "./stripe"
import { auth } from "./auth"

export type ProcessCheckoutResponse = {
    sessionUrl: string;
    order: OrderWithItemsAndProduct
};

export async function processCheckout(): Promise<ProcessCheckoutResponse> {
    const cart = await getCart()
    const session = await auth()
    const userId = session?.user?.id

    if (!cart || cart.items.length === 0) {
        throw new Error("Cart is empty")
    }

    let orderId: string | null = null;

    try {
        // using $transaction means everything or nothing is going to happen -> no partial result
        // in $transaction we access models not via prisma.<model> but via it's cb param
        const order = await prisma.$transaction(async (tx) => {
            const total = cart.subtotal

            const newOrder = await tx.order.create({
                data: {
                    total,
                    userId: userId || null
                }
            })

            const orderItems = cart.items.map((item) => ({
                productId: item.product.id,
                quantity: item.quantity,
                orderId: newOrder.id,
                price: item.product.price,
            }))

            await tx.orderItem.createMany({
                data: orderItems
            })

            await tx.cartItem.deleteMany({
                where: {
                    cartId: cart.id
                }
            })

            await tx.cart.delete({
                where: {
                    id: cart.id
                }
            })

            return newOrder
        });

        orderId = order.id

        //1. reload full order
        const fullOrder = await prisma.order.findUnique({
            where: {
                id: order.id,
            },
            include: {
                items: {
                    include: {
                        product: true,
                    }
                }
            }
        });
        //2. confirm the order was loaded
        console.log("fullOrder:", fullOrder)
        if (!fullOrder) {
            throw new Error("Order not found")
        }
        //3.create stripe session
        const { sessionId, sessionUrl } = await createCheckoutSession(fullOrder);
        //4. return the session url and handle the errors
        if (!sessionId || !sessionUrl) {
            throw new Error("Failed to create stripe session")
        }
        //5. store sessionId in the Order & change the Order status
        await prisma.order.update({
            where: {
                id: fullOrder.id
            },
            data: {
                stripeSessionId: sessionId,
                status: "pending_payment",
            }
        });

        (await cookies()).delete("cartId")

        return {
            sessionUrl,
            order: fullOrder,
        }
    } catch (e) {
        if (orderId && e instanceof Error && e.message.includes("Stripe")) {
            await prisma.order.update({
                where: {
                    id: orderId
                },
                data: {
                    status: "failed"
                }
            });
        }
        console.log("Error creating order:", e)
        throw new Error("Failed to create order")
    }
}