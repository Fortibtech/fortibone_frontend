"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native"
import MaterialIcon from "react-native-vector-icons/MaterialIcons"
import { useUserStore } from "@/store/userStore"
import { router } from "expo-router"

const UserProfileScreen: React.FC = () => {
  const user = useUserStore.getState().userProfile
  const [loading, setLoading] = useState(false)

  const handleEditProfile = () => {
    router.push("/fournisseurSetting/editProfile")
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1BB874" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcon name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil Utilisateur</Text>
        <TouchableOpacity style={styles.menuButton}>
          <MaterialIcon name="more-vert" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Image
            source={user?.profileImageUrl ? { uri: user.profileImageUrl } : require("@/assets/images/icon.png")}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editAvatarButton}>
            <MaterialIcon name="edit" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.userName}>
          {user?.firstName || "Jean"} {user?.lastName || "Dupont"}
        </Text>
        <Text style={styles.userRole}>{user?.profileType || "Dupont"}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Informations Contact</Text>

        {/* Email */}
        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <MaterialIcon name="email" size={20} color="#1BB874" />
          </View>
          <Text style={styles.infoText}>{user?.email || "john.doe@gmail.com"}</Text>
        </View>

        {/* Phone */}
        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <MaterialIcon name="phone" size={20} color="#1BB874" />
          </View>
          <Text style={styles.infoText}>{user?.phoneNumber || "+37 53 07 08 73"}</Text>
        </View>

        {/* Location */}
        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <MaterialIcon name="location-on" size={20} color="#1BB874" />
          </View>
          <Text style={styles.infoText}>
            {user?.city && user?.country ? `${user.city}, ${user.country}` : "Douala, Littoral, Cameroun"}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
        <MaterialIcon name="person" size={20} color="#FFFFFF" />
        <Text style={styles.editButtonText}>Modifier les informations</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  menuButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 30,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E8E8E8",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#1BB874",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 6,
  },
  userRole: {
    fontSize: 13,
    color: "#666666",
  },
  infoSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  infoText: {
    fontSize: 13,
    color: "#333333",
    flex: 1,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1BB874",
    marginHorizontal: 20,
    marginVertical: 30,
    paddingVertical: 14,
    borderRadius: 20,
    gap: 10,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})

export default UserProfileScreen
