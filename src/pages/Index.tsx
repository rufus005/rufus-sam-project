import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/SEO";
import HeroBanner from "@/components/home/HeroBanner";
import FeaturesStrip from "@/components/home/FeaturesStrip";
import PromoBanners from "@/components/home/PromoBanners";
import CategoriesSection from "@/components/home/CategoriesSection";
import ProductSection from "@/components/home/ProductSection";
import WhyChooseUsSection from "@/components/home/WhyChooseUsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import BranchesSection from "@/components/home/BranchesSection";
import Banner from "@/components/Banner";
import NewsletterSection from "@/components/NewsletterSection";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, Zap } from "lucide-react";

export default function Index() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const featuredQuery = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("is_active", true)
        .order("position", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  const trendingQuery = useQuery({
    queryKey: ["trending-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("is_active", true)
        .order("price", { ascending: false })
        .limit(4);
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

  const handleToggleWishlist = (productId: string) => {
    if (!user) { window.location.href = "/login"; return; }
    toggleWishlist.mutate(productId);
  };

  const homeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Dynamic Shoe Rack",
    description:
      "Shoe racks, shoe shelters and shoe cabinets in Bangalore — metal, wooden and multi-layer designs with free delivery and free installation.",
    url: "https://www.dynamicshoerack.in/",
    image: "https://www.dynamicshoerack.in/og-image.jpg",
    telephone: "+91-7899779304",
    priceRange: "₹₹",
    address: { "@type": "PostalAddress", addressLocality: "Bangalore", addressCountry: "IN", addressRegion: "Karnataka" },
    areaServed: "Bangalore",
  };

  return (
    <Layout>
      <SEO
        title="Shoe Rack in Bangalore | Free Delivery & Installation"
        description="Buy metal & wooden shoe racks, shoe shelters and shoe cabinets in Bangalore. Free delivery & free installation across the city. Best prices guaranteed."
        keywords="shoe rack in Bangalore, shoe shelter, shoe cabinet, metal shoe rack, wooden shoe rack, free delivery, free installation, shoe storage rack Bangalore, multi layer shoe rack"
        canonical="/"
        jsonLd={homeJsonLd}
      />
      <HeroBanner />
      <FeaturesStrip />
      <PromoBanners />

      <CategoriesSection categories={categoriesQuery.data ?? []} />

      <ProductSection
        title="Trending Now"
        subtitle="Most popular picks"
        icon={TrendingUp}
        products={(trendingQuery.data as any[]) ?? []}
        isLoading={trendingQuery.isLoading}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={isInWishlist}
        columns={4}
        bgClass="bg-secondary/30"
      />

      <ProductSection
        title="New Arrivals"
        subtitle="Latest additions to our store"
        icon={Zap}
        products={(featuredQuery.data as any[]) ?? []}
        isLoading={featuredQuery.isLoading}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={isInWishlist}
      />

      <WhyChooseUsSection />
      <TestimonialsSection />
      <BranchesSection />
      <NewsletterSection />

      <section className="container py-14 md:py-20">
        <Banner
          title="Ready to start shopping?"
          subtitle="Create your free account today and get access to exclusive deals and offers."
          ctaText={user ? "Browse Products" : "Get Started"}
          ctaLink={user ? "/products" : "/register"}
          secondaryCtaText={user ? "View Orders" : "Browse Products"}
          secondaryCtaLink={user ? "/orders" : "/products"}
          variant="primary"
          align="center"
        />
      </section>
    </Layout>
  );
}
