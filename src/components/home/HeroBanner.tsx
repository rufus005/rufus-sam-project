import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

interface Slide {
  badge: string;
  headline: string;
  highlight: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
  secondaryCta: string;
  secondaryCtaLoggedIn: string;
  secondaryLink: string;
  secondaryLinkLoggedIn: string;
  gradient: string;
  accent: string;
}

const slides: Slide[] = [
  {
    badge: "New Season Collection",
    headline: "Discover Quality",
    highlight: "Products You'll Love",
    subtitle: "Shop curated collections at unbeatable prices. Fast shipping, secure checkout, and exceptional service.",
    cta: "Shop Now",
    ctaLink: "/products",
    secondaryCta: "Create Account",
    secondaryCtaLoggedIn: "My Profile",
    secondaryLink: "/register",
    secondaryLinkLoggedIn: "/profile",
    gradient: "from-primary/10 via-background to-accent/5",
    accent: "from-primary to-accent",
  },
  {
    badge: "Flash Sale — Limited Time",
    headline: "Up to 50% Off",
    highlight: "Trending Styles",
    subtitle: "Grab the hottest deals before they're gone. Top brands, unbeatable prices, free returns.",
    cta: "Shop Sale",
    ctaLink: "/products",
    secondaryCta: "View Trending",
    secondaryCtaLoggedIn: "View Trending",
    secondaryLink: "/products",
    secondaryLinkLoggedIn: "/products",
    gradient: "from-accent/10 via-background to-primary/5",
    accent: "from-accent to-primary",
  },
  {
    badge: "Curated For You",
    headline: "Explore Our",
    highlight: "Premium Collection",
    subtitle: "Handpicked premium products with verified quality. Experience shopping at its finest.",
    cta: "Explore Now",
    ctaLink: "/products",
    secondaryCta: "Browse Categories",
    secondaryCtaLoggedIn: "Browse Categories",
    secondaryLink: "/products",
    secondaryLinkLoggedIn: "/products",
    gradient: "from-primary/8 via-background to-secondary/10",
    accent: "from-primary via-accent to-primary",
  },
];

const INTERVAL = 6000;

export default function HeroBanner() {
  const { user } = useAuth();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
    },
    [current]
  );

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((p) => (p + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((p) => (p - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const t = setInterval(next, INTERVAL);
    return () => clearInterval(t);
  }, [next]);

  const slide = slides[current];
  const secondaryText = user ? slide.secondaryCtaLoggedIn : slide.secondaryCta;
  const secondaryHref = user ? slide.secondaryLinkLoggedIn : slide.secondaryLink;

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <section className={`relative overflow-hidden bg-gradient-to-br ${slide.gradient} min-h-[420px] md:min-h-[520px] lg:min-h-[580px]`}>
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_60%)]" />
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-card/60 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors shadow-md"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 text-foreground" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-card/60 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors shadow-md"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 text-foreground" />
      </button>

      {/* Slide content */}
      <div className="container relative z-10 py-16 md:py-28 lg:py-36">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-6 border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" /> {slide.badge}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              {slide.headline}
              <br />
              <span className={`bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent`}>
                {slide.highlight}
              </span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-md leading-relaxed">
              {slide.subtitle}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25 hover-scale" asChild>
                <Link to={slide.ctaLink}>
                  {slide.cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base hover-scale" asChild>
                <Link to={secondaryHref}>{secondaryText}</Link>
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all duration-500 ${
              i === current ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-border/30 z-20">
        <motion.div
          key={current}
          className="h-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: INTERVAL / 1000, ease: "linear" }}
        />
      </div>
    </section>
  );
}
