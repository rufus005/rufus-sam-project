import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import ProductGrid from "@/components/ProductGrid";
import { type LucideIcon } from "lucide-react";

interface ProductSectionProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  products: any[];
  isLoading: boolean;
  onAddToCart: (id: string) => void;
  onToggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  columns?: number;
  bgClass?: string;
}

export default function ProductSection({
  title,
  subtitle,
  icon: Icon,
  products,
  isLoading,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  columns = 4,
  bgClass = "",
}: ProductSectionProps) {
  if (!isLoading && products.length === 0) return null;

  return (
    <section className={bgClass}>
      <div className="container py-14 md:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
                <p className="text-muted-foreground text-sm mt-0.5">{subtitle}</p>
              </div>
            </div>
            <Button variant="ghost" className="hover-scale" asChild>
              <Link to="/products">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <ProductGrid
            products={products}
            isLoading={isLoading}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
            isWishlisted={isWishlisted}
            columns={columns}
          />
        </motion.div>
      </div>
    </section>
  );
}
