import { router } from "expo-router"
import { View, ScrollView, Text, TouchableOpacity } from "react-native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"

export default function TermsAndConditions() {
  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#E5E5E5",
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text
          style={{ fontSize: 18, fontWeight: "600", marginLeft: 16, flex: 1, textAlign: "center", color: "#333333" }}
        >
          Termes & Conditions d'u...
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
        {/* Terme n°1 */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#333333", marginBottom: 8 }}>Terme n°1</Text>
          <Text style={{ fontSize: 14, color: "#666666", lineHeight: 22 }}>
            Morem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis
            tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit
            sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus. Class aptent taciti sociosqu ad litora
            torquent
          </Text>
        </View>

        {/* Terme n°2 */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#333333", marginBottom: 8 }}>Terme n°2</Text>
          <Text style={{ fontSize: 14, color: "#666666", lineHeight: 22 }}>
            Morem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis
            tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit
            sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus. Class aptent taciti sociosqu ad litora
            torquent
          </Text>
        </View>

        {/* Terme n°3 */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#333333", marginBottom: 8 }}>Terme n°3</Text>
          <Text style={{ fontSize: 14, color: "#666666", lineHeight: 22 }}>
            Morem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis
            tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit
            sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus. Class aptent taciti sociosqu ad litora
            torquent
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}
