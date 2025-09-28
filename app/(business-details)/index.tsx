import BackButton from "@/components/BackButton";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const Index = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={styles.container}>
      <BackButton />
      <Text>Index {JSON.stringify(id)}</Text>
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

export default Index;
