import { Link } from "react-router-dom";
import { formatPrice } from "@/lib/currency";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingBag, Calendar, ChevronRight } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

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
        <div className="container py-20 text-center max-w-md mx-auto">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Sign in to view orders</h1>
          <p className="text-muted-foreground mb-6">Track your orders and view purchase history.</p>
          <Button size="lg" asChild><Link to="/login">Sign In</Link></Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 md:py-12 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="text-muted-foreground text-sm">{ordersQuery.data?.length ?? 0} orders</p>
          </div>
        </div>

        {ordersQuery.isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : ordersQuery.data?.length === 0 ? (
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">Start shopping to see your orders here.</p>
            <Button size="lg" asChild><Link to="/products">Start Shopping</Link></Button>
          </div>
        ) : (
          <div className="space-y-4">
            {ordersQuery.data?.map((order) => {
              const orderItems = (order as any).order_items ?? [];
              return (
                <div key={order.id} className="rounded-2xl border bg-card overflow-hidden hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 bg-secondary/30">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Order ID</p>
                        <p className="font-mono text-sm font-medium">#{order.id.slice(0, 8)}</p>
                      </div>
                      <div className="hidden sm:block h-8 w-px bg-border" />
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[order.status] ?? "bg-secondary text-secondary-foreground"}`}>
                        {order.status}
                      </span>
                      <span className="font-bold text-lg">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                  {/* Items preview */}
                  <div className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {orderItems.slice(0, 3).map((item: any) => (
                          <div key={item.id} className="h-10 w-10 rounded-lg bg-muted overflow-hidden border-2 border-card shrink-0">
                            <img src={item.product_image || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {orderItems.length > 3 && (
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center border-2 border-card shrink-0 text-xs font-medium text-muted-foreground">
                            +{orderItems.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground flex-1">{orderItems.length} item{orderItems.length !== 1 ? "s" : ""}</span>
                      <Link to={`/order-confirmation/${order.id}`} className="flex items-center gap-1 text-sm text-primary font-medium hover:underline">
                        Details <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
