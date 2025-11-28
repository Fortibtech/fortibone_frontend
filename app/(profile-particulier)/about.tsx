import BackButton from "@/components/BackButton";
import React from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const About = () => {
  return (
    <SafeAreaView style={styles.container}>
         <BackButton />
      <Text>About</Text>
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

export default About;
