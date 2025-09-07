import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Attribute {
  id: string;
  name: string;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  description?: string | null;
  attributes?: Attribute[];
}

interface Props {
  category: Category;
}

const CategoryInfo: React.FC<Props> = ({ category }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{category.name}</Text>
      {category.description ? (
        <Text style={styles.description}>{category.description}</Text>
      ) : null}

      {category.attributes && category.attributes.length > 0 && (
        <View style={styles.tagsContainer}>
          {category.attributes.map((attr) => (
            <View key={attr.id} style={styles.tag}>
              <Text style={styles.tagText}>{attr.name}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#555",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 6,
  },
  tag: {
    backgroundColor: "#e3e3e3",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
    color: "#333",
  },
});

export default CategoryInfo;
