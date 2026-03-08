import { Link } from "react-router-dom";
import { formatPrice } from "@/lib/currency";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Orders() {
  const { user } = useAuth();

  const ordersQuery = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (!user) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Sign in to view orders</h1>
          <Button asChild><Link to="/login">Sign In</Link></Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        {ordersQuery.isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : ordersQuery.data?.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground mb-4">No orders yet.</p>
            <Button asChild><Link to="/products">Start Shopping</Link></Button>
          </div>
        ) : (
          <div className="space-y-4">
            {ordersQuery.data?.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={order.status === "delivered" ? "default" : "secondary"} className="capitalize">
                      {order.status}
                    </Badge>
                    <span className="font-bold">{formatPrice(order.total)}</span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {(order as any).order_items?.length ?? 0} item(s)
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
