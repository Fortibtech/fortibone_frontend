import { StyleSheet, View, Text } from "react-native";

const Tables = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tables</Text>
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

export default Tables;
