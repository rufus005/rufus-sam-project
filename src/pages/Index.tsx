import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import ProductGrid from "@/components/ProductGrid";
import Banner from "@/components/Banner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, ShoppingBag, Truck, Shield, Star, Zap } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import { motion } from "framer-motion";

export default function Index() {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const featuredQuery = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
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
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_50%)]" />
        <div className="container relative py-16 md:py-28 lg:py-36">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-6">
                <Zap className="h-3.5 w-3.5" /> New Season Collection
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Discover Quality
                <br />
                <span className="text-primary">Products You'll Love</span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-md leading-relaxed">
                Shop curated collections at unbeatable prices. Fast shipping, secure checkout, and exceptional customer service.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="h-12 px-8 text-base" asChild>
                  <Link to="/products">
                    Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                  <Link to="/register">Create Account</Link>
                </Button>
              </div>
              {/* Trust badges */}
              <div className="flex items-center gap-6 mt-10 pt-6 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="h-4 w-4 text-primary" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 text-primary" />
                  <span>Top Rated</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:grid grid-cols-2 gap-4"
            >
              {featuredQuery.data?.slice(0, 4).map((product, i) => (
                <Link
                  key={product.id}
                  to={`/products/${product.slug}`}
                  className={`relative rounded-2xl overflow-hidden bg-muted group ${
                    i === 0 ? "row-span-2 aspect-[3/4]" : "aspect-square"
                  }`}
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ShoppingBag className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-sm font-semibold truncate">{product.name}</p>
                    <p className="text-white/80 text-xs">${Number(product.price).toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="border-y bg-card">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: ShoppingBag, title: "Wide Selection", desc: "1000+ curated products" },
              { icon: Truck, title: "Fast Delivery", desc: "2-5 day shipping" },
              { icon: Shield, title: "Secure Checkout", desc: "SSL encrypted" },
              { icon: Star, title: "Top Quality", desc: "Verified reviews" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-sm">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categoriesQuery.data && categoriesQuery.data.length > 0 && (
        <section className="container py-12 md:py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Shop by Category</h2>
              <p className="text-muted-foreground text-sm mt-1">Find what you need</p>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/products">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {categoriesQuery.data.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200"
              >
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="container py-12 md:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">New Arrivals</h2>
            <p className="text-muted-foreground text-sm mt-1">Latest additions to our store</p>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/products">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <ProductGrid
          products={(featuredQuery.data as any[]) ?? []}
          isLoading={featuredQuery.isLoading}
          onAddToCart={handleAddToCart}
        />
      </section>

      {/* Promo Banner */}
      <section className="container pb-12 md:pb-16">
        <Banner
          title="Ready to start shopping?"
          subtitle="Create your free account today and get access to exclusive deals and offers."
          ctaText="Get Started"
          ctaLink="/register"
          secondaryCtaText="Browse Products"
          secondaryCtaLink="/products"
          variant="primary"
          align="center"
        />
      </section>
    </Layout>
  );
}
