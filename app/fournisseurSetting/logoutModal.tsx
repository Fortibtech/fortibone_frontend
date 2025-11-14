import { View, Text, TouchableOpacity, Modal } from "react-native"

export default function LogoutModal({visible, onCancel, onLogout } : {visible: boolean,onCancel: () => void, onLogout: () => void}) {
  return (
    <Modal transparent={true} animationType="fade" visible={visible}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            paddingHorizontal: 24,
            paddingVertical: 28,
            width: "100%",
          }}
        >
          {/* Title */}
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#E91E63", textAlign: "center", marginBottom: 12 }}>
            Déconnexion
          </Text>

          {/* Message */}
          <Text style={{ fontSize: 14, color: "#666666", textAlign: "center", marginBottom: 28, lineHeight: 20 }}>
            Voulez-vous vraiment vous déconnecter ?
          </Text>

          {/* Buttons */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 24,
                backgroundColor: "#E8F5E9",
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={onCancel}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#1BB874" }}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 24,
                backgroundColor: "#E91E63",
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={onLogout}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#FFFFFF" }}>Déconnecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}
