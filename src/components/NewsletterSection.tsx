import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Mail, CheckCircle, Send } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: email.trim().toLowerCase() });

    if (error) {
      if (error.code === "23505") {
        toast({ title: "You're already subscribed!", description: "Thank you for being part of our community." });
        setSubscribed(true);
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } else {
      setSubscribed(true);
      toast({ title: "Subscribed!", description: "You'll receive updates on new products and deals." });
    }
    setLoading(false);
  };

  return (
    <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container py-16 md:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-6">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Stay in the Loop</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Subscribe to our newsletter and get exclusive deals, new arrivals, and style tips delivered to your inbox.
          </p>

          {subscribed ? (
            <div className="flex items-center justify-center gap-3 p-6 rounded-2xl bg-accent/10 border border-accent/20">
              <CheckCircle className="h-6 w-6 text-accent" />
              <div className="text-left">
                <p className="font-semibold text-accent">You're subscribed!</p>
                <p className="text-sm text-muted-foreground">We'll keep you updated with the best deals.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-12 bg-card"
                  required
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6" disabled={loading}>
                {loading ? "Subscribing..." : (
                  <>Subscribe <Send className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </form>
          )}

          <p className="text-xs text-muted-foreground mt-4">
            No spam, ever. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}
