import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Percent, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function PromoBanners() {
  return (
    <section className="container py-14 md:py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8 md:p-10 group"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Percent className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">Limited Offer</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-2">Up to 50% Off</h3>
            <p className="text-primary-foreground/80 text-sm mb-6">On selected products this season.</p>
            <Button variant="secondary" size="lg" className="hover-scale" asChild>
              <Link to="/products">Shop Sale <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent to-accent/80 text-accent-foreground p-8 md:p-10 group"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">New Arrivals</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-2">Fresh Collection</h3>
            <p className="text-accent-foreground/80 text-sm mb-6">Check out the latest trending products.</p>
            <Button variant="secondary" size="lg" className="hover-scale" asChild>
              <Link to="/products">Explore <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
