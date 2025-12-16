import { StyleSheet, View, Text } from "react-native";
interface Props {
  businessId: string | null;
}
const ZoneTarifs = ({ businessId }: Props) => {
  return (
    <View style={styles.container}>
      <Text>Zone Tarifs Component for Business ID: {businessId}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ZoneTarifs;
