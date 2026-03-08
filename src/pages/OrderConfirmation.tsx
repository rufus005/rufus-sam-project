import { useParams, Link } from "react-router-dom";
import { formatPrice } from "@/lib/currency";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();

  const orderQuery = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", orderId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const order = orderQuery.data;

  return (
    <Layout>
      <div className="container py-16 max-w-2xl text-center">
        <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground mb-6">Thank you for your purchase.</p>

        {order && (
          <div className="border rounded-lg p-6 text-left mb-8">
            <p className="text-sm text-muted-foreground mb-1">Order ID</p>
            <p className="font-mono text-sm mb-4">{order.id}</p>
            <p className="text-sm text-muted-foreground mb-1">Total</p>
            <p className="font-bold text-lg mb-4">${Number(order.total).toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mb-1">Status</p>
            <p className="capitalize">{order.status}</p>

            {order.order_items && order.order_items.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <p className="text-sm font-semibold mb-2">Items</p>
                {order.order_items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span>{item.product_name} × {item.quantity}</span>
                    <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <Button asChild><Link to="/products">Continue Shopping</Link></Button>
          <Button variant="outline" asChild><Link to="/orders">View Orders</Link></Button>
        </div>
      </div>
    </Layout>
  );
}
