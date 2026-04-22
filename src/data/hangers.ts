export interface Hanger {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  image: string;
  whatsapp: string; // digits only
  mapsUrl: string;
}

/**
 * Update hanger types here. Used by both the grid and detail pages.
 */
export const hangers: Hanger[] = [
  {
    slug: "wooden-hanger",
    name: "Wooden Hanger",
    shortDescription: "Premium polished wood, ideal for suits & coats.",
    description:
      "Crafted from solid hardwood with a smooth polished finish, our wooden hangers offer strength and elegance. Perfect for suits, blazers, and heavy coats — keeping their shape for years.",
    image:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=900&q=80",
    whatsapp: "9100000000",
    mapsUrl: "https://maps.google.com/?q=Banjara+Hills+Hyderabad",
  },
  {
    slug: "plastic-hanger",
    name: "Plastic Hanger",
    shortDescription: "Lightweight, durable, and budget-friendly.",
    description:
      "High-grade ABS plastic hangers built for everyday use. Lightweight, moisture-resistant, and available in multiple colors — perfect for shirts, tops, and casual wear.",
    image:
      "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?auto=format&fit=crop&w=900&q=80",
    whatsapp: "9100000000",
    mapsUrl: "https://maps.google.com/?q=Banjara+Hills+Hyderabad",
  },
  {
    slug: "velvet-hanger",
    name: "Velvet Hanger",
    shortDescription: "Non-slip velvet finish for delicate clothing.",
    description:
      "Soft velvet-coated hangers with a slim profile that saves wardrobe space. The non-slip surface keeps silk, satin, and knitwear securely in place.",
    image:
      "https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?auto=format&fit=crop&w=900&q=80",
    whatsapp: "9100000000",
    mapsUrl: "https://maps.google.com/?q=Banjara+Hills+Hyderabad",
  },
  {
    slug: "metal-hanger",
    name: "Metal Hanger",
    shortDescription: "Heavy-duty steel hangers for long-term use.",
    description:
      "Chrome-finished steel hangers built to hold the heaviest garments. Rust-resistant and ideal for retail displays, laundries, and home wardrobes.",
    image:
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=900&q=80",
    whatsapp: "9100000000",
    mapsUrl: "https://maps.google.com/?q=Banjara+Hills+Hyderabad",
  },
  {
    slug: "kids-hanger",
    name: "Kids Hanger",
    shortDescription: "Small-size hangers designed for children's wear.",
    description:
      "Compact, colorful, and safe — designed specifically for kids' clothing. Smooth edges and lightweight build make them easy for children to use too.",
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
    whatsapp: "9100000000",
    mapsUrl: "https://maps.google.com/?q=Banjara+Hills+Hyderabad",
  },
  {
    slug: "multi-tier-hanger",
    name: "Multi-Tier Hanger",
    shortDescription: "Saves space — holds up to 5 garments at once.",
    description:
      "A smart space-saving hanger with multiple tiers. Great for organizing pants, scarves, or shirts in compact wardrobes without compromising visibility.",
    image:
      "https://images.unsplash.com/photo-1558769132-92e6c11671b8?auto=format&fit=crop&w=900&q=80",
    whatsapp: "9100000000",
    mapsUrl: "https://maps.google.com/?q=Banjara+Hills+Hyderabad",
  },
];

export const getHangerBySlug = (slug: string) => hangers.find((h) => h.slug === slug);
