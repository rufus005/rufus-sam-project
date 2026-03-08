import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/currency";
import { ShoppingCart } from "lucide-react";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

const statusBadgeClass = (status: string) => {
  const map: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    processing: "bg-primary/10 text-primary border-primary/20",
    shipped: "bg-accent/10 text-accent border-accent/20",
    delivered: "bg-accent/10 text-accent border-accent/20",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return map[status] ?? "";
};

const paymentBadgeClass = (status: string) => {
  const map: Record<string, string> = {
    paid: "bg-accent/10 text-accent",
    cod: "bg-primary/10 text-primary",
    failed: "bg-destructive/10 text-destructive",
    unpaid: "bg-muted text-muted-foreground",
  };
  return map[status] ?? "bg-muted text-muted-foreground";
};

export default function AdminOrders() {
  const qc = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({ title: "Order status updated" });
    },
  });

  const getCustomerInfo = (order: any) => {
    const addr = order.shipping_address;
    if (typeof addr === "object" && addr) {
      return { name: addr.full_name || "—", phone: addr.phone || "" };
    }
    return { name: "—", phone: "" };
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground mt-1">{ordersQuery.data?.length ?? 0} total orders</p>
        </div>

        <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30">
                  <TableHead className="font-semibold">Order</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Customer</TableHead>
                  <TableHead className="font-semibold">Items</TableHead>
                  <TableHead className="font-semibold">Total</TableHead>
                  <TableHead className="font-semibold">Payment</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersQuery.data?.map((order) => {
                  const customer = getCustomerInfo(order);
                  return (
                    <TableRow key={order.id} className="hover:bg-secondary/20">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <ShoppingCart className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <span className="font-mono text-xs font-medium">#{order.id.slice(0, 8)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{customer.name}</p>
                          {customer.phone && <p className="text-xs text-muted-foreground">{customer.phone}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-secondary text-xs font-medium">
                          {(order as any).order_items?.length ?? 0}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold">${Number(order.total).toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentBadgeClass(order.payment_status)}`}>
                          {order.payment_status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Select value={order.status} onValueChange={(v) => updateStatus.mutate({ id: order.id, status: v })}>
                          <SelectTrigger className={`w-32 h-8 text-xs border ${statusBadgeClass(order.status)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map((s) => (
                              <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!ordersQuery.data || ordersQuery.data.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      No orders yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
