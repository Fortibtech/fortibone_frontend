"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, Modal, Clipboard } from "react-native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"

export default function ShareAppModal({ visible, onClose }: {visible: boolean, onClose: () => void}) {
  const [copied, setCopied] = useState(false)
  const shareLink = "https://fortibon.fortitech.com/qGmm8Ly8?"

  const handleCopy = () => {
    Clipboard.setString(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal transparent={true} animationType="fade" visible={visible}>
      <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "flex-end" }}>
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 20,
            paddingVertical: 24,
            paddingBottom: 40,
          }}
        >
          {/* Title */}
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#333333", marginBottom: 8, textAlign: "center" }}>
            Partager l'application
          </Text>

          {/* Description */}
          <Text style={{ fontSize: 14, color: "#666666", textAlign: "center", marginBottom: 16, lineHeight: 20 }}>
            Inviter vos proches à utiliser l'application FortibOne et recevez des bonus.
          </Text>

          {/* Link Input */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F5F5F5",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 16,
            }}
          >
            <MaterialIcons name="link" size={20} color="#1BB874" />
            <Text style={{ fontSize: 13, color: "#1BB874", marginLeft: 8, flex: 1 }}>{shareLink}</Text>
          </View>

          {/* Buttons */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 0.4,
                paddingVertical: 12,
                borderRadius: 24,
                backgroundColor: "#E8F5E9",
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={handleCopy}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#1BB874" }}>{copied ? "✓" : "Copier"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 24,
                backgroundColor: "#1BB874",
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={onClose}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#FFFFFF" }}>Partager le lien</Text>
            </TouchableOpacity>
          </View>

          {/* Close Button */}
          <TouchableOpacity onPress={onClose} style={{ marginTop: 12 }}>
            <Text style={{ fontSize: 14, color: "#999999", textAlign: "center" }}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}
