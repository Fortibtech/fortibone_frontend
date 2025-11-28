import React from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "@/components/BackButton";
const Notifications = () => {
  return (
    <SafeAreaView style={styles.container}>
       <BackButton />
      <Text>Notifications</Text>
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

export default Notifications;
