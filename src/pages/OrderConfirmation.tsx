import { useParams, Link } from "react-router-dom";
import { formatPrice } from "@/lib/currency";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, AlertTriangle } from "lucide-react";

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();

  const orderQuery = useQuery({
    queryKey: ["order", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", orderId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const order = orderQuery.data;

  if (orderQuery.isLoading) {
    return (
      <Layout>
        <div className="container py-16 max-w-2xl">
          <div className="space-y-4">
            <Skeleton className="h-16 w-16 rounded-full mx-auto" />
            <Skeleton className="h-8 w-1/2 mx-auto" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (orderQuery.isError || !order) {
    return (
      <Layout>
        <div className="container py-16 max-w-2xl text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Order not found</h1>
          <p className="text-muted-foreground mb-6">
            {orderQuery.isError
              ? "There was an error loading this order. Please try again."
              : "This order doesn't exist or you don't have permission to view it."}
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild><Link to="/orders">My Orders</Link></Button>
            <Button variant="outline" asChild><Link to="/products">Continue Shopping</Link></Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-16 max-w-2xl text-center">
        <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground mb-6">Thank you for your purchase.</p>

        <div className="border rounded-lg p-6 text-left mb-8">
          <p className="text-sm text-muted-foreground mb-1">Order ID</p>
          <p className="font-mono text-sm mb-4">{order.id}</p>
          <p className="text-sm text-muted-foreground mb-1">Total</p>
          <p className="font-bold text-lg mb-4">{formatPrice(order.total)}</p>
          <p className="text-sm text-muted-foreground mb-1">Payment</p>
          <p className="capitalize mb-4">{order.payment_status}</p>
          <p className="text-sm text-muted-foreground mb-1">Status</p>
          <p className="capitalize">{order.status}</p>

          {order.order_items && order.order_items.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <p className="text-sm font-semibold mb-2">Items</p>
              {order.order_items.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm py-1">
                  <span>{item.product_name} × {item.quantity}</span>
                  <span>{formatPrice(Number(item.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <Button asChild><Link to="/products">Continue Shopping</Link></Button>
          <Button variant="outline" asChild><Link to="/orders">View Orders</Link></Button>
        </div>
      </div>
    </Layout>
  );
}
