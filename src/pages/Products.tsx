import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Search } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
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

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Products</h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-48">
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
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low → High</SelectItem>
              <SelectItem value="price-desc">Price: High → Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Product Grid */}
        {productsQuery.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        ) : productsQuery.data?.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productsQuery.data?.map((product) => (
              <Card key={product.id} className="group overflow-hidden">
                <Link to={`/products/${product.slug}`}>
                  <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="text-muted-foreground text-sm">No image</div>
                    )}
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link to={`/products/${product.slug}`}>
                    <h3 className="font-heading font-semibold text-sm mb-1 hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  {(product as any).categories?.name && (
                    <Badge variant="secondary" className="text-xs mb-2">{(product as any).categories.name}</Badge>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-lg">${Number(product.price).toFixed(2)}</span>
                      {product.compare_at_price && (
                        <span className="text-sm text-muted-foreground line-through">${Number(product.compare_at_price).toFixed(2)}</span>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.preventDefault();
                        if (!user) {
                          window.location.href = "/login";
                          return;
                        }
                        addToCart.mutate({ productId: product.id });
                      }}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
