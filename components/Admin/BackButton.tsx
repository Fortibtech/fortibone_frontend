import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";

const BackButtonAdmin = () => {
  return (
    <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
      <Ionicons name="arrow-back-outline" size={24} color="#000" />
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

export default BackButtonAdmin;
