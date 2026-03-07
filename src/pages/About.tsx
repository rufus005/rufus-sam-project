import Layout from "@/components/layout/Layout";

export default function About() {
  return (
    <Layout>
      <div className="container max-w-3xl py-16 space-y-8">
        <h1 className="text-4xl font-heading font-bold">About Rufus Sam</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Rufus Sam is your go-to destination for quality products at competitive prices. 
          We believe in making online shopping simple, reliable, and enjoyable.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg border p-6 space-y-2">
            <h3 className="font-heading font-semibold text-lg">Our Mission</h3>
            <p className="text-sm text-muted-foreground">
              To provide customers with a seamless shopping experience, offering curated products 
              backed by exceptional customer service.
            </p>
          </div>
          <div className="rounded-lg border p-6 space-y-2">
            <h3 className="font-heading font-semibold text-lg">Our Promise</h3>
            <p className="text-sm text-muted-foreground">
              Fast shipping, easy returns, and a commitment to quality that you can count on 
              every time you shop with us.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
