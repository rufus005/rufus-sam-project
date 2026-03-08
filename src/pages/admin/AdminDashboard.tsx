import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import DashboardCard from "@/components/admin/DashboardCard";
import StatusBadge from "@/components/admin/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/currency";
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, Mail } from "lucide-react";

export default function AdminDashboard() {
  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [products, orders, profiles, subscribers] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id, total"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
      ]);
      const totalRevenue = orders.data?.reduce((s, o) => s + Number(o.total), 0) ?? 0;
      return {
        products: products.count ?? 0,
        orders: orders.data?.length ?? 0,
        users: profiles.count ?? 0,
        subscribers: subscribers.count ?? 0,
        revenue: totalRevenue,
      };
    },
  });

  const recentOrdersQuery = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const s = stats.data;

  const cards = [
    { label: "Total Revenue", value: s ? formatPrice(s.revenue) : "—", icon: DollarSign, color: "text-accent bg-accent/10" },
    { label: "Total Orders", value: s?.orders ?? "—", icon: ShoppingCart, color: "text-primary bg-primary/10" },
    { label: "Total Products", value: s?.products ?? "—", icon: Package, color: "text-orange-500 bg-orange-500/10" },
    { label: "Total Users", value: s?.users ?? "—", icon: Users, color: "text-purple-500 bg-purple-500/10" },
    { label: "Subscribers", value: s?.subscribers ?? "—", icon: Mail, color: "text-pink-500 bg-pink-500/10" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your store overview.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {cards.map((card) => (
            <DashboardCard key={card.label} {...card} />
          ))}
        </div>

        {/* Recent Orders */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
            <Link to="/admin/orders" className="text-sm text-primary hover:underline font-medium">View All →</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentOrdersQuery.data?.map((order) => {
                const addr = order.shipping_address;
                const name = typeof addr === "object" && addr && (addr as any).full_name ? (addr as any).full_name : "—";
                return (
                  <div key={order.id} className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <ShoppingCart className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{name}</p>
                        <p className="text-xs text-muted-foreground">
                          #{order.id.slice(0, 8)} · {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={order.status} />
                      <StatusBadge status={order.payment_status} />
                      <span className="font-bold text-sm min-w-[70px] text-right">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                );
              })}
              {(!recentOrdersQuery.data || recentOrdersQuery.data.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-12">No orders yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
