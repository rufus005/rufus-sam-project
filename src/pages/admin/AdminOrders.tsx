import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import StatusBadge from "@/components/admin/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/currency";
import { ShoppingCart, Search, Eye } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

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
      return { name: addr.full_name || "—", phone: addr.phone || "", address: `${addr.street_address || ""}, ${addr.city || ""} ${addr.postal_code || ""}` };
    }
    return { name: "—", phone: "", address: "" };
  };

  const filteredOrders = ordersQuery.data?.filter((order) => {
    const customer = getCustomerInfo(order);
    const matchSearch = !search || customer.name.toLowerCase().includes(search.toLowerCase()) || order.id.includes(search);
    const matchStatus = filterStatus === "all" || order.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground mt-1">{ordersQuery.data?.length ?? 0} total orders</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by customer or order ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders?.map((order) => {
                  const customer = getCustomerInfo(order);
                  return (
                    <TableRow key={order.id} className="hover:bg-secondary/20">
                      <TableCell>
                        <span className="font-mono text-xs font-medium">#{order.id.slice(0, 8)}</span>
                      </TableCell>
                      <TableCell className="text-sm">{new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{customer.name}</p>
                          {customer.phone && <p className="text-xs text-muted-foreground">{customer.phone}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center justify-center h-6 min-w-[24px] rounded-full bg-secondary text-xs font-medium px-1.5">
                          {(order as any).order_items?.length ?? 0}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold">{formatPrice(order.total)}</TableCell>
                      <TableCell>
                        <StatusBadge status={order.payment_status} />
                      </TableCell>
                      <TableCell>
                        <Select value={order.status} onValueChange={(v) => updateStatus.mutate({ id: order.id, status: v })}>
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map((s) => (
                              <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="h-8 w-8 rounded-lg bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!filteredOrders || filteredOrders.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">No orders found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id.slice(0, 8)}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (() => {
            const customer = getCustomerInfo(selectedOrder);
            return (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <StatusBadge status={selectedOrder.status} />
                  <StatusBadge status={selectedOrder.payment_status} />
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Customer</p>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">{customer.phone}</p>
                  <p className="text-sm text-muted-foreground">{customer.address}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Items</p>
                  <div className="space-y-2">
                    {(selectedOrder as any).order_items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                        <div className="h-10 w-10 rounded bg-muted overflow-hidden shrink-0">
                          <img src={item.product_image || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product_name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold">{formatPrice(Number(item.price) * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
