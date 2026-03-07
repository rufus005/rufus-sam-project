import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast({ title: "Message sent!", description: "We'll get back to you soon." });
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <Layout>
      <div className="container max-w-5xl py-16">
        <h1 className="text-4xl font-heading font-bold mb-8">Contact Us</h1>
        <div className="grid gap-12 md:grid-cols-2">
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Have a question or need help? Fill out the form and we'll get back to you as soon as possible.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-sm">support@rufussam.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-sm">123 Commerce St, New York, NY 10001</span>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input required placeholder="Your name" />
            </div>
            <div>
              <Label>Email</Label>
              <Input required type="email" placeholder="you@example.com" />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea required rows={5} placeholder="How can we help?" />
            </div>
            <Button type="submit" className="w-full" disabled={sending}>
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
