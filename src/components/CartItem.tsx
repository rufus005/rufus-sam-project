import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CartItemProps {
  item: {
    id: string;
    quantity: number;
    product: {
      name: string;
      slug: string;
      price: number;
      image_url: string | null;
    };
  };
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const lineTotal = Number(item.product.price) * item.quantity;

  return (
    <div className="flex gap-4 p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow">
      <Link to={`/products/${item.product.slug}`} className="shrink-0">
        <div className="h-24 w-24 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
          {item.product.image_url ? (
            <img
              src={item.product.image_url}
              alt={item.product.name}
              className="object-cover h-full w-full"
              loading="lazy"
            />
          ) : (
            <span className="text-xs text-muted-foreground">No img</span>
          )}
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <Link
          to={`/products/${item.product.slug}`}
          className="font-heading font-semibold text-sm hover:text-primary transition-colors line-clamp-2"
        >
          {item.product.name}
        </Link>
        <p className="text-base font-bold text-primary mt-1">${Number(item.product.price).toFixed(2)}</p>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center border rounded-lg bg-secondary/50">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            onClick={() => onRemove(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="font-bold">${lineTotal.toFixed(2)}</p>
      </div>
    </div>
  );
}
