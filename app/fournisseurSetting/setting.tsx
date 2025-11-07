"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from "react-native"
import { useRouter } from "expo-router"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"

interface SettingItem {
  id: string
  icon: string
  label: string
  type: "arrow" | "toggle"
  onPress?: () => void
  value?: boolean
  onChange?: (value: boolean) => void
}

const Setting: React.FC = () => {
  const router = useRouter()
  const [notifications, setNotifications] = useState(true)
  const [theme, setTheme] = useState(true)

  const settings: SettingItem[] = [
    {
      id: "password",
      icon: "lock",
      label: "Changer le mot de passe",
      type: "arrow",
      onPress: () => router.push("/fournisseurSetting/changePassword"),
    },
    {
      id: "notifications",
      icon: "notifications",
      label: "Notifications",
      type: "toggle",
      value: notifications,
      onChange: setNotifications,
    },
    {
      id: "theme",
      icon: "brightness-4",
      label: "Thème",
      type: "toggle",
      value: theme,
      onChange: setTheme,
    },
    {
      id: "language",
      icon: "language",
      label: "Langue",
      type: "arrow",
      onPress: () => router.push("/fournisseurSetting/Language"),
    },
  ]

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settings.map((setting) => (
          <TouchableOpacity
            key={setting.id}
            style={styles.settingItem}
            onPress={setting.onPress}
            disabled={setting.type === "toggle"}
          >
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <MaterialIcons name={setting.icon} size={20} color="#1BB874" />
              </View>
              <Text style={styles.settingLabel}>{setting.label}</Text>
            </View>
            {setting.type === "arrow" && <MaterialIcons name="chevron-right" size={24} color="#CCCCCC" />}
            {setting.type === "toggle" && (
              <Switch
                value={setting.value}
                onValueChange={setting.onChange}
                trackColor={{ false: "#E0E0E0", true: "#1BB874" }}
                thumbColor={setting.value ? "#FFFFFF" : "#FFFFFF"}
              />
            )}
          </TouchableOpacity>
        ))}

        {/* Language Display */}
        <TouchableOpacity style={styles.languageItem}>
          <View style={styles.languageContent}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="language" size={20} color="#1BB874" />
            </View>
            <Text style={styles.settingLabel}>Langue</Text>
          </View>
          <View style={styles.flagContainer}>
            <Text style={styles.flag}>🇫🇷</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginVertical: 8,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginVertical: 8,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  languageContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  flagContainer: {
    marginRight: 8,
  },
  flag: {
    fontSize: 20,
  },
})

export default Setting
