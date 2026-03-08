import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export function useWishlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const wishlistQuery = useQuery({
    queryKey: ["wishlist", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlist_items")
        .select("*, products(id, name, slug, price, compare_at_price, image_url, stock_quantity, categories(name, slug))")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
  });

  const toggleWishlist = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Please sign in");
      const existing = wishlistQuery.data?.find((w) => w.product_id === productId);
      if (existing) {
        const { error } = await supabase.from("wishlist_items").delete().eq("id", existing.id);
        if (error) throw error;
        return { action: "removed" as const };
      } else {
        const { error } = await supabase.from("wishlist_items").insert({ user_id: user.id, product_id: productId });
        if (error) throw error;
        return { action: "added" as const };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast({
        title: result.action === "added" ? "Added to Wishlist" : "Removed from Wishlist",
      });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const isInWishlist = (productId: string) =>
    wishlistQuery.data?.some((w) => w.product_id === productId) ?? false;

  return {
    items: wishlistQuery.data ?? [],
    isLoading: wishlistQuery.isLoading,
    toggleWishlist,
    isInWishlist,
    wishlistCount: wishlistQuery.data?.length ?? 0,
  };
}
