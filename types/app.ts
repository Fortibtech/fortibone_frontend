import { ImageSourcePropType } from "react-native";
export interface Enterprise {
  id: number;
  name: string;
  rating: number;
  category: string;
  image: ImageSourcePropType;
  discount?: string;
  categoryId?: string;
}
