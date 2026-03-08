import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import ProductGrid from "@/components/ProductGrid";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";

export default function Products() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") ?? "";
  const initialCategory = searchParams.get("category") ?? "all";

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState("newest");

  const { user } = useAuth();
  const { addToCart } = useCart();

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const productsQuery = useQuery({
    queryKey: ["products", search, category, sort],
    queryFn: async () => {
      let q = supabase.from("products").select("*, categories(name, slug)").eq("is_active", true);
      if (search) q = q.ilike("name", `%${search}%`);
      if (category && category !== "all") q = q.eq("category_id", category);
      if (sort === "price-asc") q = q.order("price", { ascending: true });
      else if (sort === "price-desc") q = q.order("price", { ascending: false });
      else q = q.order("created_at", { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const handleAddToCart = (productId: string) => {
    if (!user) { window.location.href = "/login"; return; }
    addToCart.mutate({ productId });
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Products</h1>
          <p className="text-muted-foreground">
            {productsQuery.data ? `${productsQuery.data.length} products found` : "Browse our collection"}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 p-4 rounded-xl bg-card border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-48 bg-background">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoriesQuery.data?.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full sm:w-48 bg-background">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low → High</SelectItem>
              <SelectItem value="price-desc">Price: High → Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        <ProductGrid
          products={(productsQuery.data as any[]) ?? []}
          isLoading={productsQuery.isLoading}
          onAddToCart={handleAddToCart}
        />
      </div>
    </Layout>
  );
}
