import React from "react";
import { StyleSheet, View, Text } from "react-native";

const Menus = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Menus</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    color: "red",
  },
});

export default Menus;
