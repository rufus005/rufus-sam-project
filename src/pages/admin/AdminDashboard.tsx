import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/currency";
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, ArrowUpRight } from "lucide-react";

export default function AdminDashboard() {
  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [products, orders, profiles] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id, total"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      const totalRevenue = orders.data?.reduce((s, o) => s + Number(o.total), 0) ?? 0;
      return {
        products: products.count ?? 0,
        orders: orders.data?.length ?? 0,
        users: profiles.count ?? 0,
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
    { label: "Total Revenue", value: s ? formatPrice(s.revenue) : "—", icon: DollarSign, href: "/admin/orders", color: "text-accent bg-accent/10" },
    { label: "Orders", value: s?.orders ?? "—", icon: ShoppingCart, href: "/admin/orders", color: "text-primary bg-primary/10" },
    { label: "Products", value: s?.products ?? "—", icon: Package, href: "/admin/products", color: "text-orange-500 bg-orange-500/10" },
    { label: "Customers", value: s?.users ?? "—", icon: Users, href: "/admin", color: "text-purple-500 bg-purple-500/10" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back to your store overview.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Link key={card.label} to={card.href}>
              <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${card.color}`}>
                      <card.icon className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <Link to="/admin/orders" className="text-sm text-primary hover:underline">View All</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrdersQuery.data?.map((order) => {
                const addr = order.shipping_address;
                const name = typeof addr === "object" && addr && (addr as any).full_name ? (addr as any).full_name : "—";
                return (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ShoppingCart className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{formatPrice(order.total)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        order.payment_status === "paid"
                          ? "bg-accent/10 text-accent"
                          : order.payment_status === "cod"
                          ? "bg-primary/10 text-primary"
                          : "bg-destructive/10 text-destructive"
                      }`}>
                        {order.payment_status}
                      </span>
                    </div>
                  </div>
                );
              })}
              {(!recentOrdersQuery.data || recentOrdersQuery.data.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
