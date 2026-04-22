import { Link, useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { getHangerBySlug } from "@/data/hangers";
import { ArrowLeft, MapPin, MessageCircle } from "lucide-react";

export default function HangerDetail() {
  const { slug } = useParams<{ slug: string }>();
  const hanger = slug ? getHangerBySlug(slug) : undefined;

  if (!hanger) {
    return (
      <Layout>
        <section className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-3">Hanger not found</h1>
          <Button asChild>
            <Link to="/products/hangers">
              <ArrowLeft className="h-4 w-4" /> Back to Hangers
            </Link>
          </Button>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container py-10 md:py-16">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/products/hangers">
            <ArrowLeft className="h-4 w-4" /> Back to Hangers
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="rounded-2xl overflow-hidden bg-muted shadow-sm">
            <img
              src={hanger.image}
              alt={hanger.name}
              className="w-full h-full object-cover aspect-square"
            />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-heading">{hanger.name}</h1>
              <p className="text-muted-foreground mt-2">{hanger.shortDescription}</p>
            </div>

            <p className="text-base leading-relaxed">{hanger.description}</p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button asChild size="lg" className="flex-1">
                <a
                  href={`https://wa.me/${hanger.whatsapp}?text=${encodeURIComponent(
                    `Hi, I'm interested in the ${hanger.name}.`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-5 w-5" /> WhatsApp
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="flex-1">
                <a href={hanger.mapsUrl} target="_blank" rel="noopener noreferrer">
                  <MapPin className="h-5 w-5" /> Visit Store
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
