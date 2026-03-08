import Layout from "@/components/layout/Layout";
import PageHero from "@/components/shared/PageHero";
import AboutSections from "@/components/shared/AboutSections";
import FeatureCard from "@/components/shared/FeatureCard";
import StatsCounter from "@/components/shared/StatsCounter";
import TestimonialCard from "@/components/shared/TestimonialCard";
import TeamMemberCard from "@/components/shared/TeamMemberCard";
import { Truck, Shield, Award, Headphones, Users, Package, Building2, Star, Target, Eye, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const brandSections = [
  {
    title: "Our Story",
    description:
      "Founded with a passion for quality and value, Rufus Sam started as a small vision to make premium products accessible to everyone. Today we serve thousands of happy customers worldwide.",
    icon: <BookOpen className="h-6 w-6 text-primary" />,
  },
  {
    title: "Our Mission",
    description:
      "To provide customers with a seamless shopping experience, offering carefully curated products backed by exceptional customer service and fast, reliable delivery.",
    icon: <Target className="h-6 w-6 text-primary" />,
  },
  {
    title: "Our Vision",
    description:
      "To become the most trusted online marketplace where quality meets affordability, building lasting relationships with every customer we serve.",
    icon: <Eye className="h-6 w-6 text-primary" />,
  },
];

const features = [
  { icon: Truck, title: "Fast Delivery", description: "Free shipping on orders over $50 with 2-5 day delivery across the country." },
  { icon: Shield, title: "Secure Payment", description: "Your transactions are protected with industry-leading SSL encryption." },
  { icon: Award, title: "Quality Products", description: "Every product is vetted for quality before it reaches our shelves." },
  { icon: Headphones, title: "24/7 Support", description: "Our dedicated team is always available to help with any questions." },
];

const stats = [
  { icon: Users, value: 15000, label: "Happy Customers" },
  { icon: Package, value: 2500, label: "Total Products" },
  { icon: Building2, value: 120, label: "Trusted Brands" },
  { icon: Star, value: 4800, suffix: "+", label: "5-Star Ratings" },
];

const testimonials = [
  { name: "Sarah Johnson", role: "Verified Buyer", content: "Amazing quality and super fast delivery! I've been shopping here for months and every order has exceeded my expectations.", rating: 5 },
  { name: "Michael Chen", role: "Regular Customer", content: "The customer support team is incredibly helpful. They resolved my issue within minutes. Highly recommended!", rating: 5 },
  { name: "Emily Davis", role: "First-time Buyer", content: "Great selection of products at competitive prices. The website is easy to navigate and checkout was smooth.", rating: 4 },
  { name: "David Wilson", role: "Loyal Customer", content: "I love the quality of products here. Returns are hassle-free and the team genuinely cares about customer satisfaction.", rating: 5 },
];

const team = [
  { name: "Alex Morgan", role: "Founder & CEO", bio: "Passionate entrepreneur with 10+ years in e-commerce, dedicated to making quality products accessible to all." },
  { name: "Priya Sharma", role: "Head of Operations", bio: "Operations expert ensuring every order is processed, packed, and shipped with care and efficiency." },
  { name: "James Lee", role: "Lead Developer", bio: "Tech enthusiast building seamless shopping experiences with cutting-edge web technologies." },
  { name: "Sophie Carter", role: "Customer Success", bio: "Customer-first advocate making sure every interaction leaves a positive and lasting impression." },
];

export default function About() {
  return (
    <Layout>
      <PageHero
        badge="About Us"
        title="The Story Behind Rufus Sam"
        subtitle="We're on a mission to make online shopping simple, reliable, and enjoyable for everyone."
      />

      {/* Brand Story */}
      <section className="container py-14 md:py-20">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Who We Are</h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">Learn about our journey, what drives us, and where we're headed.</p>
        </motion.div>
        <AboutSections sections={brandSections} />
      </section>

      {/* Why Choose Us */}
      <section className="bg-secondary/30">
        <div className="container py-14 md:py-20">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Why Choose Us</h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">Here's what sets us apart from the rest.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container py-14 md:py-20">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Our Numbers Speak</h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">Milestones that reflect our growth and your trust.</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 rounded-2xl border bg-card p-6 md:p-10">
          {stats.map((s, i) => (
            <StatsCounter key={s.label} {...s} index={i} />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-secondary/30">
        <div className="container py-14 md:py-20">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
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

      {/* Team */}
      <section className="container py-14 md:py-20">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Meet Our Team</h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">The people behind your shopping experience.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {team.map((m, i) => (
            <TeamMemberCard key={m.name} {...m} index={i} />
          ))}
        </div>
      </section>
    </Layout>
  );
}
