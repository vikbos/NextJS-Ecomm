import { Badge } from "@/components/ui/badge";
import { OrderWithItemsAndProduct } from "@/lib/stripe";
import { formatPrice } from "@/lib/utils";
import { AlertCircle, CheckCircle, Clock, CreditCard } from "lucide-react";

interface OrderSummaryProps {
    order: OrderWithItemsAndProduct;
}

function StatusBadge({ status }: { status: string }) {
    const statusMap: Record<string, string> = {
        pending: "Pending",
        pending_payment: "Pending Payment",
        failed: "Failed",
        paid: "Paid",
    }

    return (
        <Badge variant="outline">
            {statusMap[status]}
        </Badge>
    )
}

export default async function OrderSummary({ order }: OrderSummaryProps) {

    const getStatusDetails = (status: string) => {
    switch (status) {
      case "paid":
        return {
          label: "Paid",
          variant: "default" as const,
          icon: <CheckCircle className="w-4 h-4" />,
        };
      case "pending":
        return {
          label: "Pending",
          variant: "secondary" as const,
          icon: <Clock className="w-4 h-4" />,
        };
      case "pending_payment":
        return {
          label: "Payment Pending",
          variant: "outline" as const,
          icon: <CreditCard className="w-4 h-4" />,
        };
      case "failed":
        return {
          label: "Failed",
          variant: "destructive" as const,
          icon: <AlertCircle className="w-4 h-4" />,
        };
      case "payment_processed":
        return {
          label: "Payment Processed",
          variant: "outline" as const,
          icon: <CreditCard className="w-4 h-4" />,
        };
      default:
        return {
          label: status,
          variant: "secondary" as const,
          icon: <Clock className="w-4 h-4" />,
        };
    }
  };

  const statusDetails = getStatusDetails(order.status);

    return (
        <div className="flex flex-col pt-4">
            <div className="text-sm text-muted-foreground">
                <div className="flex items-center justify-between border-b pb-1 mb-3">
                    <p>Subtotal</p>
                    <p className="text-base text-foreground">{formatPrice(order.total)}</p>
                </div>

                <div className="flex items-center justify-between border-b pb-1 mb-3">
                    <p>Taxes</p>
                    <p>{formatPrice(0)}</p>
                </div>

                <div className="flex items-center justify-between border-b pb-1 mb-3">
                    <p>Shipping</p>
                    <p>{formatPrice(0)}</p>
                </div>

                <div className="flex items-center justify-between border-b pb-1 mb-3">
                    <p>Status</p>
                    <Badge variant={statusDetails.variant} className="flex items-center gap-1">
                        {statusDetails.icon}
                        {statusDetails.label}
                    </Badge>
                </div>

                <div className="flex items-center justify-between border-b pb-1 mb-3 font-semibold">
                    <p>Total</p>
                    <p className="text-base text-foreground">{formatPrice(order.total)}</p>
                </div>
            </div>
        </div>
    )
}