import React from "react";
import { StyleSheet, SafeAreaView, Text } from "react-native";

const Help = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text>Help</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Help;
