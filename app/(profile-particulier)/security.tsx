import React from "react";
import { StyleSheet, View, SafeAreaView, Text } from "react-native";

const Security = () => {
  return (
    <View>
      <SafeAreaView style={styles.container}>
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
