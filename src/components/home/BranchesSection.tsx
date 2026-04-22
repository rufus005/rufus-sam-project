import { motion } from "framer-motion";
import { MapPin, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { branches, type Branch } from "@/data/branches";

interface BranchesSectionProps {
  items?: Branch[];
  title?: string;
  subtitle?: string;
}

export default function BranchesSection({
  items = branches,
  title = "Our Branches",
  subtitle = "Visit us at any of our stores",
}: BranchesSectionProps) {
  if (!items.length) return null;

  return (
    <section className="container py-14 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
        <p className="text-muted-foreground text-sm mt-2">{subtitle}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((branch, i) => (
          <motion.div
            key={branch.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="overflow-hidden rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 h-full flex flex-col">
              <div className="aspect-[16/10] overflow-hidden bg-muted">
                <img
                  src={branch.image}
                  alt={branch.name}
                  loading="lazy"
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
              </div>
              <CardContent className="p-5 flex flex-col gap-4 flex-1">
                <div>
                  <h3 className="font-heading font-semibold text-lg">{branch.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 flex items-start gap-1.5">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{branch.address}</span>
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-auto">
                  <Button asChild size="sm" className="col-span-3">
                    <a href={branch.mapsUrl} target="_blank" rel="noopener noreferrer">
                      <MapPin className="h-4 w-4" /> Visit Store
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a href={`tel:${branch.phone}`}>
                      <Phone className="h-4 w-4" /> Call
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="col-span-2">
                    <a
                      href={`https://wa.me/${branch.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4" /> WhatsApp
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
