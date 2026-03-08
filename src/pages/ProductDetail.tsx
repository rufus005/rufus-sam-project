import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Minus, Plus, Star, Zap, Truck, Shield, RotateCcw, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { formatPrice } from "@/lib/currency";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import ProductGrid from "@/components/ProductGrid";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const productQuery = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const reviewsQuery = useQuery({
    queryKey: ["reviews", productQuery.data?.id],
    enabled: !!productQuery.data?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productQuery.data!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const product = productQuery.data;

  const relatedQuery = useQuery({
    queryKey: ["related-products", product?.category_id, product?.id],
    enabled: !!product,
    queryFn: async () => {
      let q = supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("is_active", true)
        .neq("id", product!.id)
        .limit(4);
      if (product!.category_id) q = q.eq("category_id", product!.category_id);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const avgRating = reviewsQuery.data?.length
    ? reviewsQuery.data.reduce((s, r) => s + r.rating, 0) / reviewsQuery.data.length
    : 0;

  const discount = product?.compare_at_price
    ? Math.round((1 - Number(product.price) / Number(product.compare_at_price)) * 100)
    : 0;

  const allImages = product
    ? [product.image_url, ...(product.images || [])].filter(Boolean) as string[]
    : [];

  const goToImage = (dir: number) => {
    setSelectedImage((prev) => {
      const next = prev + dir;
      if (next < 0) return allImages.length - 1;
      if (next >= allImages.length) return 0;
      return next;
    });
  };

  if (productQuery.isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button asChild><Link to="/products">Back to Products</Link></Button>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    if (!user) { navigate("/login"); return; }
    addToCart.mutate({ productId: product.id, quantity: qty });
  };

  const handleBuyNow = () => {
    if (!user) { navigate("/login"); return; }
    addToCart.mutate({ productId: product.id, quantity: qty }, {
      onSuccess: () => navigate("/checkout"),
    });
  };

  const handleRelatedAddToCart = (productId: string) => {
    if (!user) { navigate("/login"); return; }
    addToCart.mutate({ productId });
  };

  const handleToggleWishlist = (productId: string) => {
    if (!user) { navigate("/login"); return; }
    toggleWishlist.mutate(productId);
  };

  return (
    <Layout>
      <div className="container py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-foreground transition-colors">Products</Link>
          {(product as any).categories?.name && (
            <>
              <span>/</span>
              <span>{(product as any).categories.name}</span>
            </>
          )}
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {/* Main Image with Slider */}
            <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={allImages[selectedImage] || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </AnimatePresence>

              {/* Navigation Arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => goToImage(-1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => goToImage(1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Image counter */}
              {allImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-card/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium shadow-sm">
                  {selectedImage + 1} / {allImages.length}
                </div>
              )}

              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1">
                  -{discount}% OFF
                </Badge>
              )}

              {/* Wishlist */}
              <button
                onClick={() => handleToggleWishlist(product.id)}
                className="absolute top-4 right-4 h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors shadow-md"
              >
                <Heart className={`h-5 w-5 transition-colors ${isInWishlist(product.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
              </button>
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-20 w-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200 ${
                      selectedImage === i
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent hover:border-muted-foreground/30 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {(product as any).categories?.name && (
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-2">
                {(product as any).categories.name}
              </p>
            )}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 leading-tight">{product.name}</h1>

            {reviewsQuery.data && reviewsQuery.data.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-4 w-4 ${s <= Math.round(avgRating) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
                <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({reviewsQuery.data.length} reviews)</span>
              </div>
            )}

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl md:text-4xl font-bold text-primary">{formatPrice(product.price)}</span>
              {product.compare_at_price && (
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.compare_at_price)}</span>
              )}
              {discount > 0 && (
                <Badge variant="secondary" className="text-xs">Save {discount}%</Badge>
              )}
            </div>

            <Separator className="my-6" />

            <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium w-20">Quantity</span>
                <div className="flex items-center border rounded-lg">
                  <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQty(Math.max(1, qty - 1))}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{qty}</span>
                  <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQty(Math.min(product.stock_quantity, qty + 1))}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-xs text-muted-foreground">
                  {product.stock_quantity > 0 ? `${product.stock_quantity} available` : "Out of stock"}
                </span>
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 h-12"
                  disabled={product.stock_quantity === 0}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  size="lg"
                  className="flex-1 h-12"
                  disabled={product.stock_quantity === 0}
                  onClick={handleBuyNow}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {product.stock_quantity === 0 ? "Out of Stock" : "Buy Now"}
                </Button>
              </div>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => handleToggleWishlist(product.id)}
              >
                <Heart className={`h-4 w-4 mr-2 ${isInWishlist(product.id) ? "fill-destructive text-destructive" : ""}`} />
                {isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
              </Button>
            </div>

            <Separator className="my-6" />

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Truck, label: "Free Shipping" },
                { icon: Shield, label: "Secure Payment" },
                { icon: RotateCcw, label: "Easy Returns" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary/50 text-center">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-xs font-medium">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
        {reviewsQuery.data && reviewsQuery.data.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviewsQuery.data.map((review) => (
                <div key={review.id} className="border rounded-xl p-5 bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                    {review.title && <span className="font-semibold text-sm">{review.title}</span>}
                  </div>
                  {review.content && <p className="text-sm text-muted-foreground leading-relaxed">{review.content}</p>}
                  <p className="text-xs text-muted-foreground mt-3">{new Date(review.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedQuery.data && relatedQuery.data.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <ProductGrid
              products={(relatedQuery.data as any[]) ?? []}
              isLoading={relatedQuery.isLoading}
              onAddToCart={handleRelatedAddToCart}
              onToggleWishlist={handleToggleWishlist}
              isWishlisted={isInWishlist}
              columns={4}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
