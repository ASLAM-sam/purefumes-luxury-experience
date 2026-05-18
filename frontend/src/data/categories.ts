export type Category = {
  _id?: string;
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  color: string;
  sortOrder: number;
  displayOrder: number;
  isActive: boolean;
  active: boolean;
  isDeleted: boolean;
  featured: boolean;
  productCount: number;
  createdAt?: string | null;
  updatedAt?: string | null;
};
