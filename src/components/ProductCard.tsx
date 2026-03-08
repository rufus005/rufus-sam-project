import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compare_at_price?: number | null;
    image_url?: string | null;
    stock_quantity: number;
    categories?: { name: string; slug: string } | null;
  };
  onAddToCart?: (productId: string) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;

  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-card">
      <Link to={`/products/${product.slug}`} className="block relative overflow-hidden">
        <div className="aspect-[4/5] bg-muted flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="text-muted-foreground text-sm">No image</div>
          )}
        </div>
        {discount > 0 && (
          <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold">
            -{discount}%
          </Badge>
        )}
        {product.stock_quantity === 0 && (
          <Badge variant="secondary" className="absolute top-3 right-3">
            Sold Out
          </Badge>
        )}
      </Link>
      <CardContent className="p-4 space-y-2">
        {product.categories?.name && (
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            {product.categories.name}
          </p>
        )}
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-heading font-semibold text-sm leading-tight hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-lg">${Number(product.price).toFixed(2)}</span>
            {product.compare_at_price && (
              <span className="text-xs text-muted-foreground line-through">
                ${Number(product.compare_at_price).toFixed(2)}
              </span>
            )}
          </div>
          {onAddToCart && product.stock_quantity > 0 && (
            <Button
              size="icon"
              variant="outline"
              className="h-9 w-9 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={(e) => {
                e.preventDefault();
                onAddToCart(product.id);
              }}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
