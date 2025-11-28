import { StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
const List = () => {
  return (
    <TouchableOpacity style={styles.iconButton}>
      <Ionicons name="ellipsis-vertical" size={22} color="#000" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#eef0f4",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default List;
