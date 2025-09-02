import React from "react";
import { StyleSheet, SafeAreaView, Text } from "react-native";

const Notifications = () => {
  return (
    <SafeAreaView style={styles.container}>
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
