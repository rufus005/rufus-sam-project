import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Search, Mail, Download } from "lucide-react";
import { useState } from "react";

export default function AdminSubscribers() {
  const [search, setSearch] = useState("");

  const subscribersQuery = useQuery({
    queryKey: ["admin-subscribers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = subscribersQuery.data?.filter((s) =>
    !search || s.email.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    if (!subscribersQuery.data?.length) {
      toast({ title: "No subscribers to export", variant: "destructive" });
      return;
    }
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Email,Subscribed Date\n"
      + subscribersQuery.data.map((s) => `${s.email},${new Date(s.created_at).toLocaleDateString()}`).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    toast({ title: "Exported successfully" });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Newsletter Subscribers</h1>
            <p className="text-muted-foreground mt-1">{subscribersQuery.data?.length ?? 0} subscribers</p>
          </div>
          <Button onClick={exportCSV} variant="outline" className="shrink-0">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30">
                  <TableHead className="font-semibold">#</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Subscribed Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered?.map((sub, i) => (
                  <TableRow key={sub.id} className="hover:bg-secondary/20">
                    <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0">
                          <Mail className="h-3.5 w-3.5 text-pink-500" />
                        </div>
                        <span className="text-sm font-medium">{sub.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(sub.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </TableCell>
                  </TableRow>
                ))}
                {(!filtered || filtered.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                      No subscribers found
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
