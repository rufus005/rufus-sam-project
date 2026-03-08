import { ShoppingBag, Truck, Shield, Star } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: ShoppingBag, title: "Wide Selection", desc: "1000+ curated products" },
  { icon: Truck, title: "Fast Delivery", desc: "2-5 day shipping" },
  { icon: Shield, title: "Secure Checkout", desc: "SSL encrypted" },
  { icon: Star, title: "Top Quality", desc: "Verified reviews" },
];

export default function FeaturesStrip() {
  return (
    <section className="border-y bg-card">
      <div className="container py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-heading font-semibold text-sm">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
