import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import {
  Mail, Phone, MapPin, Clock, Send, MessageSquare,
  HelpCircle, Instagram, Facebook, Twitter,
} from "lucide-react";
import { motion } from "framer-motion";

const faqs = [
  {
    q: "How can I track my order?",
    a: "Once your order is shipped, you'll receive an email with tracking details. You can also check order status from your account under 'My Orders'.",
  },
  {
    q: "What is your return policy?",
    a: "We accept returns within 7 days of delivery. Items must be unused and in original packaging. Contact support to initiate a return.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit/debit cards, UPI, net banking via Razorpay, and Cash on Delivery (COD).",
  },
  {
    q: "How long does shipping take?",
    a: "Standard shipping takes 3-5 business days across India. Express shipping (1-2 days) is available in select cities.",
  },
  {
    q: "How do I cancel or modify my order?",
    a: "You can contact our support within 2 hours of placing your order to cancel or modify it. After that, the order enters processing and cannot be changed.",
  },
];

const contactInfo = [
  { icon: Mail, label: "Email", value: "support@rufussam.com", href: "mailto:support@rufussam.com" },
  { icon: Phone, label: "Phone", value: "+91 123 456 7890", href: "tel:+911234567890" },
  { icon: MapPin, label: "Address", value: "123 Commerce Street, Mumbai, Maharashtra 400001, India" },
  { icon: Clock, label: "Working Hours", value: "Mon – Sat: 9:00 AM – 7:00 PM IST" },
];

const socials = [
  { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
  { icon: Facebook, label: "Facebook", href: "https://facebook.com" },
  { icon: Twitter, label: "Twitter", href: "https://twitter.com" },
];

export default function Contact() {
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast({ title: "Message sent! ✉️", description: "We'll get back to you within 24 hours." });
      (e.target as HTMLFormElement).reset();
    }, 1200);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b">
        <div className="container max-w-6xl py-14 md:py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-5">
              <MessageSquare className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">Get in Touch</h1>
            <p className="text-muted-foreground max-w-lg mx-auto text-base md:text-lg">
              Have a question or need help? We'd love to hear from you. Our team typically responds within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className="container max-w-6xl py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left — Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-1">Send us a message</h2>
              <p className="text-sm text-muted-foreground mb-6">Fill out the form below and we'll get back to you.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" required placeholder="Your name" className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" required type="email" placeholder="you@example.com" className="mt-1.5" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+91 98765 43210" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea id="message" required rows={5} placeholder="Tell us more about your query..." className="mt-1.5 resize-none" />
                </div>
                <Button type="submit" className="w-full h-12" size="lg" disabled={sending}>
                  {sending ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Right — Contact Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Info Cards */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-5">
              <h3 className="font-bold text-lg">Contact Information</h3>
              <div className="space-y-4">
                {contactInfo.map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
                      {href ? (
                        <a href={href} className="text-sm font-medium hover:text-primary transition-colors">{value}</a>
                      ) : (
                        <p className="text-sm font-medium">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Follow Us</h3>
              <div className="flex gap-3">
                {socials.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                    title={label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
                <a
                  href="https://wa.me/911234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 w-11 rounded-xl bg-green-500/10 flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
                  title="WhatsApp"
                >
                  <Phone className="h-5 w-5 text-green-600" />
                </a>
              </div>
            </div>

            {/* Mini Map */}
            <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3773.931!2d72.8311!3d18.9322!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDU1JzU2LjAiTiA3MsKwNDknNTIuMCJF!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Store Location"
                className="grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-secondary/30">
        <div className="container max-w-4xl py-12 md:py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10 mb-4">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Quick answers to common questions</p>
            </div>

            <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-b last:border-0">
                    <AccordionTrigger className="text-left text-sm font-semibold hover:text-primary py-4">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
