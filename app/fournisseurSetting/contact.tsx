"use client"

import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { useRouter } from "expo-router"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"

interface ContactItem {
  id: string
  icon: string
  label: string
  value: string
}

const Contact: React.FC = () => {
  const router = useRouter()

  const contacts: ContactItem[] = [
    {
      id: "phone",
      icon: "phone",
      label: "Téléphone",
      value: "+33 7 53 07 08 73",
    },
    {
      id: "email",
      icon: "email",
      label: "Email",
      value: "contact@fortibiome.com",
    },
    {
      id: "website",
      icon: "language",
      label: "Site web",
      value: "https://fortibiome.com",
    },
    {
      id: "address",
      icon: "location-on",
      label: "Adresse",
      value: "24 RUE ALEXANDRE, 14000 CAEN",
    },
  ]

  const handleCopyToClipboard = (value: string) => {
    // Clipboard functionality would be implemented here
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contacts</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {contacts.map((contact) => (
          <TouchableOpacity key={contact.id} style={styles.contactCard}>
            <View style={styles.contactLeft}>
              <View style={styles.iconContainer}>
                <MaterialIcons name={contact.icon} size={22} color="#1BB874" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>{contact.label}</Text>
                <Text style={styles.contactValue} numberOfLines={2}>
                  {contact.value}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleCopyToClipboard(contact.value)}>
              <MaterialIcons name="content-copy" size={20} color="#CCCCCC" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
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
  contactCard: {
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
  contactLeft: {
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
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666666",
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
})

export default Contact
