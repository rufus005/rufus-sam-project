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
      "Founded by Ismail, Dynamic Universal Marketing was built around a simple idea: practical, space-saving storage solutions every household and shop can rely on.",
    icon: <BookOpen className="h-6 w-6 text-primary" />,
  },
  {
    title: "Our Mission",
    description:
      "Deliver durable, high-capacity shoe racks with excellent service and value — keeping your space organised and your shoes protected.",
    icon: <Target className="h-6 w-6 text-primary" />,
  },
  {
    title: "Our Vision",
    description:
      "To become a trusted storage solution brand across India, known for quality craftsmanship and dependable customer service.",
    icon: <Eye className="h-6 w-6 text-primary" />,
  },
];

const features = [
  { icon: Truck, title: "Fast Delivery", description: "Same-day delivery in Bangalore on single product orders. Free delivery & installation across Karnataka." },
  { icon: Award, title: "Quality Products", description: "Durable, high-capacity shoe racks built to last for years of daily use." },
  { icon: Shield, title: "Secure Payment", description: "Your transactions are protected with industry-leading SSL encryption." },
  { icon: Headphones, title: "24/7 Support", description: "Our dedicated team is always available to help with any questions." },
];

const stats = [
  { icon: Users, value: 15000, label: "Happy Customers" },
  { icon: Package, value: 2500, label: "Total Products" },
  { icon: Building2, value: 4, label: "Branches" },
  { icon: Star, value: 4800, suffix: "+", label: "5-Star Ratings" },
];

const testimonials = [
  { name: "Ravi Kumar", role: "Verified Buyer", content: "Bought the double decker 30-pair rack for my showroom. Sturdy build, neat finish, and the team installed it the same day. Excellent service!", rating: 5 },
  { name: "Priya Naidu", role: "Home Customer", content: "The 4 rack model fits perfectly in our entryway. Free delivery and installation in Bangalore was a huge plus.", rating: 5 },
  { name: "Mohammed Anwar", role: "Shop Owner", content: "Quality is genuinely premium. Holds heavy footwear without bending. Highly recommended for retail use.", rating: 5 },
  { name: "Lakshmi S.", role: "Repeat Customer", content: "Second purchase from Dynamic Universal Marketing. Reliable products and the team is very responsive on WhatsApp.", rating: 4 },
];

const team = [
  { name: "Ismail", role: "Founder & CEO", bio: "Founder of Dynamic Universal Marketing, driven by a vision to bring practical, durable storage solutions to every home and shop." },
  { name: "Operations Lead", role: "Head of Operations", bio: "Ensures every order is processed, packed, delivered and installed with care and on time." },
  { name: "Sardik", role: "Lead Developer", bio: "Builds and maintains our digital experience so customers can browse and connect with us seamlessly." },
  { name: "Nandhini", role: "Customer Success", bio: "Customer-first advocate making sure every interaction leaves a positive and lasting impression." },
];

export default function About() {
  return (
    <Layout>
      <PageHero
        badge="About Us"
        title="The Story Behind Dynamic Universal Marketing"
        subtitle="We're on a mission to provide smart, space-saving shoe storage solutions that are reliable, durable, and accessible for every home, shop, and showroom."
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
