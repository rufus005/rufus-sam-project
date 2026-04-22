import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { hangers } from "@/data/hangers";
import { motion } from "framer-motion";
import PageHero from "@/components/shared/PageHero";

export default function Hangers() {
  return (
    <Layout>
      <PageHero
        title="Cloth Hangers"
        subtitle="Browse our complete range of premium hangers"
      />

      <section className="container py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hangers.map((h, i) => (
            <motion.div
              key={h.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/hangers/${h.slug}`} className="block group">
                <Card className="overflow-hidden rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 h-full">
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={h.image}
                      alt={h.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-heading font-semibold text-lg group-hover:text-primary transition-colors">
                      {h.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {h.shortDescription}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
