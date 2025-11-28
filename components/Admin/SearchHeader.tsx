// SearchHeader.tsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchHeaderProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onMenuPress?: () => void;
  showMenuButton?: boolean;
  backgroundColor?: string;
  inputBackgroundColor?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  value?: string;
  onChangeText?: (text: string) => void;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
  placeholder = "Rechercher un produit",
  onSearch,
  onMenuPress,
  showMenuButton = true,
  backgroundColor = "#fff",
  inputBackgroundColor = "#F5F5F5",
  style,
  inputStyle,
  value: controlledValue,
  onChangeText: controlledOnChangeText,
}) => {
  const [internalValue, setInternalValue] = useState("");

  // Use controlled value if provided, otherwise use internal state
  const searchQuery =
    controlledValue !== undefined ? controlledValue : internalValue;

  const handleSearchChange = (text: string) => {
    if (controlledOnChangeText) {
      controlledOnChangeText(text);
    } else {
      setInternalValue(text);
    }
    onSearch?.(text);
  };

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      <View style={styles.content}>
        {/* Search Input Container */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: inputBackgroundColor },
          ]}
        >
          <Ionicons name="search-outline" size={20} color="#999" />
          <TextInput
            style={[styles.searchInput, inputStyle]}
            placeholder={placeholder}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
        </View>

        {/* Menu Button */}
        {showMenuButton && (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={onMenuPress}
            activeOpacity={0.7}
          >
            <Ionicons name="menu-outline" size={28} color="#333" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Prend 50% ou plus selon espace
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#333",
  },
  menuButton: {
    padding: 4,
  },
});

export default SearchHeader;
