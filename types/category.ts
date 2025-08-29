export type CategoryAttribute = {
  id: string;
  name: string;
  categoryId: string;
};

export type Category = {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  attributes: CategoryAttribute[];
};
