import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import StatusBadge from "@/components/admin/StatusBadge";
import { formatPrice } from "@/lib/currency";
import { Search, Users, Eye, ShoppingCart } from "lucide-react";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const profilesQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const userOrdersQuery = useQuery({
    queryKey: ["admin-user-orders", selectedUserId],
    enabled: !!selectedUserId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", selectedUserId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = profilesQuery.data?.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.full_name?.toLowerCase().includes(q)) || (p.phone?.toLowerCase().includes(q)) || p.id.includes(q);
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground mt-1">{profilesQuery.data?.length ?? 0} registered users</p>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30">
                  <TableHead className="font-semibold">User</TableHead>
                  <TableHead className="font-semibold">Phone</TableHead>
                  <TableHead className="font-semibold">Joined</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered?.map((user) => (
                  <TableRow key={user.id} className="hover:bg-secondary/20">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                          ) : (
                            <Users className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.full_name || "No name"}</p>
                          <p className="text-xs text-muted-foreground font-mono">{user.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{user.phone || "—"}</TableCell>
                    <TableCell className="text-sm">{new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => setSelectedUserId(user.id)}
                        className="h-8 w-8 rounded-lg bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors"
                        title="View order history"
                      >
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!filtered || filtered.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">No users found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* User Order History Dialog */}
      <Dialog open={!!selectedUserId} onOpenChange={() => setSelectedUserId(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order History</DialogTitle>
          </DialogHeader>
          {userOrdersQuery.isLoading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading orders...</p>
          ) : !userOrdersQuery.data || userOrdersQuery.data.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No orders from this user</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userOrdersQuery.data.map((order) => (
                <div key={order.id} className="rounded-xl border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs">#{order.id.slice(0, 8)}</span>
                    <span className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString("en-IN")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={order.status} />
                    <StatusBadge status={order.payment_status} />
                  </div>
                  <div className="text-sm space-y-1">
                    {(order as any).order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-muted-foreground">
                        <span>{item.product_name} × {item.quantity}</span>
                        <span>{formatPrice(Number(item.price) * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-sm">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
