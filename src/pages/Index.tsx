import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag, Truck, Shield } from "lucide-react";

export default function Index() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container py-20 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Shop the Best,<br />
              <span className="text-primary">Delivered Fast</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Discover quality products at unbeatable prices. From everyday essentials to trending items — all in one place.
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link to="/products">
                  Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/register">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: ShoppingBag, title: "Wide Selection", desc: "Thousands of products across dozens of categories" },
            { icon: Truck, title: "Fast Delivery", desc: "Quick and reliable shipping right to your door" },
            { icon: Shield, title: "Secure Checkout", desc: "Your payment information is always protected" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="container py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start shopping?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
            Create your free account today and get access to exclusive deals and offers.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/register">Get Started</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
