import type { Brand } from "@/data/brands";

export type Size = { size: string; price: number };
export type Season = "Spring" | "Summer" | "Autumn" | "Winter";
export type BestTime = "Morning" | "Day" | "Evening" | "Night";
export type Accord = { name: string; percentage: number };

export type Product = {
  _id?: string;
  id: string;
  name: string;
  brand: string;
  brandId?: string | null;
  brandDetails?: Brand | null;
  category: "Middle Eastern" | "Designer" | "Niche";
  price?: number;
  image: string;
  images: string[];
  description: string;
  notes?: string[];
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
  accords: Accord[];
  longevity: string;
  sillage: string;
  usage: "Day" | "Night" | "Day & Night";
  timeOfDay?: "Day" | "Night" | "Day & Night" | string;
  bestTime: BestTime[];
  season?: Season[];
  seasons: Season[];
  sizes: Size[];
  stock: number;
  originalPrice?: number;
  createdAt?: string;
  updatedAt?: string;
};

export const testimonials = [
  {
    name: "Aarav M.",
    text: "Purefumes Hyderabad is my secret. The Khamrah decant convinced me to buy a full bottle.",
    location: "Hyderabad",
  },
  {
    name: "Zara K.",
    text: "Authenticity, packaging, fragrance, everything is impeccable. My go-to for niche scents.",
    location: "Mumbai",
  },
  {
    name: "Rohan S.",
    text: "Aventus from here smells exactly like the boutique. Genuine batch, fast delivery.",
    location: "Bangalore",
  },
  {
    name: "Ishita P.",
    text: "The 2ml decants let me try Xerjoff before committing. Brilliant concept, beautifully executed.",
    location: "Delhi",
  },
  {
    name: "Karan V.",
    text: "Customer service is luxury-grade. They guided me to the perfect signature scent.",
    location: "Pune",
  },
];
