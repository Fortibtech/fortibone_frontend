"use client"

import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { useRouter } from "expo-router"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { useUserStore } from "@/store/userStore"

const ContactsInfoScreen: React.FC = () => {
  const router = useRouter()
  const user = useUserStore.getState().userProfile

  const contactsData = [
    {
      id: "phone",
      label: "Téléphone",
      value: user?.phoneNumber,
    },
    {
      id: "email",
      label: "Email",
      value: user?.email,
    },
    {
      id: "website",
      label: "Site web",
      value: "https://fortibon.fortitech.com",
    },
    {
      id: "address",
      label: "Adresse",
      value: user?.city,
    },
  ]

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.arrowBack} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contacts</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {contactsData.map((contact) => (
          <View key={contact.id} style={styles.contactBox}>
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>{contact.label}</Text>
              <Text style={styles.contactValue}>{contact.value}</Text>
            </View>
            <TouchableOpacity>
              <MaterialIcons name="content-copy" size={20} color="#CCCCCC" />
            </TouchableOpacity>
          </View>
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
    // borderBottomWidth: 1,
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
  contactBox: {
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
  contactContent: {
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
  arrowBack: {
      borderWidth: 1,
    borderRadius: 50,
    borderColor: '#F8F1F1FF',
    padding: 5,
  }
})

export default ContactsInfoScreen
