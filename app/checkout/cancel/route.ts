import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { notFound, redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
        notFound()
    }

    let orderId: string | undefined = undefined;

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId)
        orderId = session.metadata?.orderId;

        if (!orderId) {
            notFound()
        }

        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                stripeSessionId: sessionId
            }
        })

        if (!order) {
            notFound()
        }

        if (order.status === "pending_payment") {
            await prisma.order.update({
                where: {
                    id: orderId
                },
                data: {
                    status: "pending",
                    stripeSessionId: null,
                }
            })
        }
    } catch (e) {
        console.error("Error retrieving Stripe session", e)
        notFound()
    }

    return orderId ? redirect(`/order/${orderId}`) : notFound()
}