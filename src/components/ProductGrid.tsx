import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "./ProductCard";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price?: number | null;
  image_url?: string | null;
  stock_quantity: number;
  categories?: { name: string; slug: string } | null;
}

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyMessage?: string;
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  isWishlisted?: (productId: string) => boolean;
  columns?: number;
}

const gridColsClass: Record<number, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
};

export default function ProductGrid({
  products,
  isLoading,
  emptyMessage = "No products found.",
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  columns = 4,
}: ProductGridProps) {
  const lgClass = gridColsClass[columns] ?? "lg:grid-cols-4";

  if (isLoading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 ${lgClass} gap-4 md:gap-6`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[4/5] rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 ${lgClass} gap-4 md:gap-6`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          isWishlisted={isWishlisted?.(product.id)}
        />
      ))}
    </div>
  );
}
