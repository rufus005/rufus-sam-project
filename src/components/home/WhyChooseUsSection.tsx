import { motion } from "framer-motion";
import FeatureCard from "@/components/shared/FeatureCard";
import { Truck, Shield, Award, Headphones } from "lucide-react";

const features = [
  { icon: Truck, title: "Fast Delivery", description: "Same-day delivery in Bangalore on single product orders. Free delivery & installation across Karnataka." },
  { icon: Award, title: "Quality Products", description: "Durable, high-capacity shoe storage racks built to last for years of daily use." },
  { icon: Shield, title: "Secure Payment", description: "Your transactions are protected with industry-leading SSL encryption." },
  { icon: Headphones, title: "24/7 Support", description: "Our dedicated team is always available to help with any questions." },
];

export default function WhyChooseUsSection() {
  return (
    <section className="container py-14 md:py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Why Choose Us</h2>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto">Here's what sets us apart from the rest.</p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((f, i) => (
          <FeatureCard key={f.title} {...f} index={i} />
        ))}
      </div>
    </section>
  );
}
