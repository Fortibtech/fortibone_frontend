import BackButton from "@/components/BackButton";
import React from "react";
import { SafeAreaView, StyleSheet, Text } from "react-native";

const Help = () => {
  return (
    <SafeAreaView style={styles.container}>
      <BackButton/>
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
