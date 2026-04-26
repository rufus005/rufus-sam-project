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
    id: "jp-nagar",
    name: "JP Nagar Branch",
    address: "JP Nagar, Bengaluru, Karnataka",
    image:
      "https://images.unsplash.com/photo-1604754742629-3e5728249d73?auto=format&fit=crop&w=800&q=80",
    mapsUrl: "https://maps.app.goo.gl/xaph3UaM3bFc8ySy6",
    phone: "7899779304",
    whatsapp: "917899779304",
  },
  {
    id: "kengeri",
    name: "Kengeri Branch",
    address: "Kengeri, Bengaluru, Karnataka",
    image:
      "https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=800&q=80",
    mapsUrl: "https://maps.app.goo.gl/ayAWJKM8bdxgSHKJ9",
    phone: "7353130441",
    whatsapp: "917353130441",
  },
  {
    id: "kr-puram",
    name: "KR Puram Branch",
    address: "KR Puram, Bengaluru, Karnataka",
    image:
      "https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=800&q=80",
    mapsUrl: "https://maps.app.goo.gl/aL4HJUvNteKyLhTBA",
    phone: "7353130440",
    whatsapp: "917353130440",
  },
  {
    id: "hosur",
    name: "Hosur Branch",
    address: "Hosur, Tamil Nadu",
    image:
      "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=800&q=80",
    mapsUrl: "https://maps.app.goo.gl/NYG7XJG6jrwYN8X2A",
    phone: "8870376945",
    whatsapp: "918870376945",
  },
];
