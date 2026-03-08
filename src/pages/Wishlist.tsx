import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { Heart } from "lucide-react";
import ProductGrid from "@/components/ProductGrid";

export default function Wishlist() {
  const { user } = useAuth();
  const { items, isLoading, toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!user) {
    return (
      <Layout>
        <div className="container py-20 text-center max-w-md mx-auto">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Heart className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Sign in to view your wishlist</h1>
          <p className="text-muted-foreground mb-6">Save your favorite items for later.</p>
          <Button size="lg" asChild><Link to="/login">Sign In</Link></Button>
        </div>
      </Layout>
    );
  }

  const products = items
    .filter((i) => i.products)
    .map((i) => ({
      id: (i.products as any).id,
      name: (i.products as any).name,
      slug: (i.products as any).slug,
      price: (i.products as any).price,
      compare_at_price: (i.products as any).compare_at_price,
      image_url: (i.products as any).image_url,
      stock_quantity: (i.products as any).stock_quantity,
      categories: (i.products as any).categories,
    }));

  const handleAddToCart = (productId: string) => {
    addToCart.mutate({ productId });
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">My Wishlist</h1>
        <p className="text-muted-foreground mb-8">{products.length} saved item{products.length !== 1 ? "s" : ""}</p>
        <ProductGrid
          products={products}
          isLoading={isLoading}
          emptyMessage="Your wishlist is empty. Start adding products you love!"
          onAddToCart={handleAddToCart}
          onToggleWishlist={(id) => toggleWishlist.mutate(id)}
          isWishlisted={isInWishlist}
        />
      </div>
    </Layout>
  );
}
