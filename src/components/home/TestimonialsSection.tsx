import { motion } from "framer-motion";
import TestimonialCard from "@/components/shared/TestimonialCard";

const testimonials = [
  { name: "Sarah Johnson", role: "Verified Buyer", content: "Amazing quality and super fast delivery! I've been shopping here for months and every order has exceeded my expectations.", rating: 5 },
  { name: "Michael Chen", role: "Regular Customer", content: "The customer support team is incredibly helpful. They resolved my issue within minutes. Highly recommended!", rating: 5 },
  { name: "Emily Davis", role: "First-time Buyer", content: "Great selection of products at competitive prices. The website is easy to navigate and checkout was smooth.", rating: 4 },
  { name: "David Wilson", role: "Loyal Customer", content: "I love the quality of products here. Returns are hassle-free and the team genuinely cares about customer satisfaction.", rating: 5 },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-secondary/30">
      <div className="container py-14 md:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">What Our Customers Say</h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">Real reviews from real shoppers.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.name} {...t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
