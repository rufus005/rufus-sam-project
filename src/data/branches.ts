export interface Branch {
  id: string;
  name: string;
  address: string;
  image: string;
  mapsUrl: string;
  phone: string; // digits only, e.g. "9100000000"
  whatsapp: string; // digits only
}

/**
 * Update branch details here. All cards are rendered dynamically from this list.
 */
export const branches: Branch[] = [
  {
    id: "hyderabad-main",
    name: "Hyderabad - Main Store",
    address: "Shop No. 12, Banjara Hills Road No. 3, Hyderabad",
    image:
      "https://images.unsplash.com/photo-1604754742629-3e5728249d73?auto=format&fit=crop&w=800&q=80",
    mapsUrl: "https://maps.google.com/?q=Banjara+Hills+Hyderabad",
    phone: "9100000000",
    whatsapp: "9100000000",
  },
  {
    id: "secunderabad",
    name: "Secunderabad Branch",
    address: "Plot 45, S.D. Road, Secunderabad",
    image:
      "https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=800&q=80",
    mapsUrl: "https://maps.google.com/?q=SD+Road+Secunderabad",
    phone: "9100000000",
    whatsapp: "9100000000",
  },
  {
    id: "gachibowli",
    name: "Gachibowli Branch",
    address: "Gachibowli Main Road, Near DLF, Hyderabad",
    image:
      "https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=800&q=80",
    mapsUrl: "https://maps.google.com/?q=Gachibowli+Hyderabad",
    phone: "9100000000",
    whatsapp: "9100000000",
  },
];
