import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Linking,
  Image,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";

export default function AboutScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          //   borderBottomWidth: 1,
          borderBottomColor: "#E5E5E5",
          height: 100,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            marginLeft: 16,
            flex: 1,
            textAlign: "center",
            color: "#333333",
          }}
        >
          A propos de FortibTech
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={{ paddingHorizontal: 16, paddingVertical: 20 }}>
        {/* Logo */}
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <View
            style={{
              width: 80,
              height: 80,
              //   backgroundColor: "#1a3a3a",
              borderRadius: 8,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={require("@/assets/images/fortib.png")}
              width={80}
              height={80}
            />
          </View>
        </View>

        {/* Présentation */}
        <View style={{ marginBottom: 24, marginTop: 25 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#333333",
              marginBottom: 8,
            }}
          >
            Présentation de l'entreprise
          </Text>
          <Text style={{ fontSize: 14, color: "#666666", lineHeight: 22 }}>
            Chez FortibTech, nous faisons passer votre entreprise au niveau
            supérieur. Nous offrons une expertise en conseil, au développement
            innovant d'applications mobiles et web, et à des solutions
            technologiques complètes et sur mesure. Quel que soit votre secteur
            ou vos défis, nous sommes prêts à propulser votre succès et de
            transformer vos ambitions en réalité.
          </Text>
        </View>

        {/* Nos Services */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#333333",
              marginBottom: 8,
            }}
          >
            Nos Services
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#666666",
              lineHeight: 22,
              marginBottom: 4,
            }}
          >
            • Développement de sites web
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#666666",
              lineHeight: 22,
              marginBottom: 4,
            }}
          >
            • Développement d'applications mobiles
          </Text>
          <Text style={{ fontSize: 14, color: "#666666", lineHeight: 22 }}>
            • Audit & conseil IT
          </Text>
        </View>

        {/* Notre Mission */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#333333",
              marginBottom: 8,
            }}
          >
            Notre Mission
          </Text>
          <Text style={{ fontSize: 14, color: "#666666", lineHeight: 22 }}>
            Morem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu
            turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus
            nec fringilla accumsan.
          </Text>
        </View>

        {/* Notre Vision */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#333333",
              marginBottom: 8,
            }}
          >
            Notre Vision
          </Text>
          <Text style={{ fontSize: 14, color: "#666666", lineHeight: 22 }}>
            Morem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu
            turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus
            nec fringilla accumsan.
          </Text>
        </View>

        {/* Nos Valeurs */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#333333",
              marginBottom: 8,
            }}
          >
            Nos Valeurs
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#666666",
              lineHeight: 22,
              marginBottom: 4,
            }}
          >
            • Morem ipsum dolor sit amet, consectetur
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#666666",
              lineHeight: 22,
              marginBottom: 4,
            }}
          >
            • Adipiscing elit
          </Text>
          <Text style={{ fontSize: 14, color: "#666666", lineHeight: 22 }}>
            • Dignissim nec fringilla
          </Text>
        </View>

        {/* Site Web */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#333333",
              marginBottom: 8,
            }}
          >
            Site Web
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://fortibon.fortitech.com")}
          >
            <Text
              style={{
                fontSize: 14,
                color: "#1BB874",
                textDecorationLine: "underline",
              }}
            >
              https://fortibon.fortitech.com
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contact */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#333333",
              marginBottom: 8,
            }}
          >
            Contact
          </Text>
          <Text style={{ fontSize: 14, color: "#666666", marginBottom: 4 }}>
            contact@fortitech.com
          </Text>
          <Text style={{ fontSize: 14, color: "#666666" }}>
            +33 7 53 07 08 73
          </Text>
        </View>

        {/* Réseaux Sociaux */}
        <View style={{ marginBottom: 100 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#333333",
              marginBottom: 12,
            }}
          >
            Réseaux Sociaux
          </Text>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <TouchableOpacity
              onPress={() => Linking.openURL("https://facebook.com")}
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <MaterialCommunityIcons
                name="facebook"
                size={28}
                color="#1877F2"
              />
              <Text>Facebook</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL("https://linkedin.com")}
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <MaterialCommunityIcons
                name="linkedin"
                size={28}
                color="#0A66C2"
              />
              <Text>Linkedln</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
