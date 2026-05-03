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
    slug: "ceiling-hanger",
    name: "Ceiling Hanger",
    shortDescription: "Space-saving ceiling-mounted cloth hanger.",
    description:
      "Heavy-duty ceiling-mounted hanger ideal for drying clothes indoors. Strong frame with smooth pulley operation — perfect for balconies and utility areas.",
    image:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=900&q=80",
    whatsapp: "917090157740",
    mapsUrl: "https://maps.app.goo.gl/xaph3UaM3bFc8ySy6",
  },
  {
    slug: "wall-mount-hanger",
    name: "Wall Mount Hanger",
    shortDescription: "Sturdy wall-mounted hanger for everyday use.",
    description:
      "Compact wall-mounted cloth hanger built with rust-resistant steel. Easy to install and folds flat against the wall when not in use.",
    image:
      "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?auto=format&fit=crop&w=900&q=80",
    whatsapp: "917090157740",
    mapsUrl: "https://maps.app.goo.gl/xaph3UaM3bFc8ySy6",
  },
  {
    slug: "wall-mount-zigzag-hanger",
    name: "Wall Mount Zigzag Hanger",
    shortDescription: "Expandable zigzag hanger — extra hanging space.",
    description:
      "Innovative zigzag-style wall mount hanger that expands to provide multiple hanging points. Great for small homes and balcony drying setups.",
    image:
      "https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?auto=format&fit=crop&w=900&q=80",
    whatsapp: "917090157740",
    mapsUrl: "https://maps.app.goo.gl/xaph3UaM3bFc8ySy6",
  },
];

export const getHangerBySlug = (slug: string) => hangers.find((h) => h.slug === slug);
