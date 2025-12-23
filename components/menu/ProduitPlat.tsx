import { StyleSheet, View, Text } from "react-native";



const ProduitPlat = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ProduitPlat</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ProduitPlat;
