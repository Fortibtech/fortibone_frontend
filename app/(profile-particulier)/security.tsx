import BackButton from "@/components/BackButton";
import React from "react";
import {  StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Security = () => {
  return (
    <View>
      <SafeAreaView style={styles.container}>
        <BackButton />
        <Text>About</Text>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Security;
