import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import heroImg1 from "@/assets/hero-shoe-rack.webp";
import heroImg2 from "@/assets/hero-shoe-rack-2.webp";
import heroImg3 from "@/assets/hero-shoe-rack-3.webp";

interface Slide {
  badge: string;
  headline: string;
  highlight: string;
  subtitle: string;
  image: string;
  imageAlt: string;
}

const slides: Slide[] = [
  {
    badge: "DYNAMIC UNIVERSAL MARKETING",
    headline: "Premium Shoe",
    highlight: "Storage Solutions",
    subtitle:
      "We provide high-quality shoe racks designed for durability and maximum capacity.",
    image: heroImg1,
    imageAlt: "Premium 5-tier shoe shelter rack with 30 pair capacity",
  },
  {
    badge: "BESTSELLER — DOUBLE DECKER",
    headline: "Double Decker",
    highlight: "12 Pair Capacity",
    subtitle:
      "Sturdy build, smart design, and easy assembly. Perfect for compact homes.",
    image: heroImg2,
    imageAlt: "2-tier double decker shoe rack with open shelves",
  },
  {
    badge: "MULTIPLE VARIANTS AVAILABLE",
    headline: "5, 4, 3 & 2 Rack",
    highlight: "Models Available",
    subtitle:
      "Choose from 5 rack (30 pairs), 4 rack (24 pairs), 3 rack (18 pairs) and 2 rack (12 pairs).",
    image: heroImg3,
    imageAlt: "3-tier shoe shelter rack with stylish front panel",
  },
];

const INTERVAL = 6000;

export default function HeroBanner() {
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

  // Preload all hero images on mount so slide transitions are instant (no flicker)
  useEffect(() => {
    slides.forEach((s) => {
      const img = new Image();
      img.src = s.image;
    });
  }, []);

  const slide = slides[current];

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_60%)]" />
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm items-center justify-center hover:bg-card transition-colors shadow-md"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 text-foreground" />
      </button>
      <button
        onClick={next}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm items-center justify-center hover:bg-card transition-colors shadow-md"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 text-foreground" />
      </button>

      {/* Mobile arrows — smaller, lower opacity, tucked at edges */}
      <button
        onClick={prev}
        className="md:hidden absolute left-1 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-card/70 backdrop-blur-sm flex items-center justify-center shadow"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-4 w-4 text-foreground" />
      </button>
      <button
        onClick={next}
        className="md:hidden absolute right-1 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-card/70 backdrop-blur-sm flex items-center justify-center shadow"
        aria-label="Next slide"
      >
        <ChevronRight className="h-4 w-4 text-foreground" />
      </button>

      <div className="container relative z-10 py-10 pb-16 md:py-20 lg:py-24">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 lg:gap-16 items-center"
          >
            {/* Left: Text */}
            <div className="text-center md:text-left order-2 md:order-1">
              <span className="inline-block text-[11px] sm:text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-4">
                {slide.badge}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] mb-4 md:mb-6">
                <span className="block text-foreground">{slide.headline}</span>
                <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {slide.highlight}
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-md mx-auto md:mx-0 leading-relaxed">
                {slide.subtitle}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Button
                  size="lg"
                  className="h-11 md:h-12 px-6 md:px-8 text-sm md:text-base shadow-lg shadow-primary/25"
                  asChild
                >
                  <Link to="/products">View Products</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 md:h-12 px-6 md:px-8 text-sm md:text-base"
                  asChild
                >
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>

            {/* Right: Product image card */}
            <div className="order-1 md:order-2 flex justify-center md:justify-end">
              <div className="relative w-full max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-lg">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl blur-2xl" />
                <div className="relative bg-card rounded-2xl shadow-2xl shadow-primary/10 p-4 sm:p-6 md:p-8 border border-border/50">
                  <img
                    src={slide.image}
                    alt={slide.imageAlt}
                    width={896}
                    height={1024}
                    className="w-full h-auto object-contain aspect-[4/5] rounded-xl"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                  />
                  {/* Hidden preload for the remaining slides — keeps them warm in cache */}
                  <div aria-hidden className="hidden">
                    {slides
                      .filter((s) => s.image !== slide.image)
                      .map((s) => (
                        <img
                          key={s.image}
                          src={s.image}
                          alt=""
                          loading="eager"
                          decoding="async"
                        />
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="absolute bottom-5 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
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
