"use client";

import type React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

interface HelpItem {
  id: string;
  icon: string;
  title: string;
  route: string;
}

const HelpCenterScreen: React.FC = () => {
  const router = useRouter();

  const helpItems: HelpItem[] = [
    // {
    //   id: "support",
    //   icon: "lock",
    //   title: "Assistance Technique",
    //   route: "/fournisseurSetting/TechnicalSupport",
    // },
    {
      id: "contacts",
      icon: "lock",
      title: "Contacts",
      route: "/fournisseurSetting/contacts",
    },
    {
      id: "faq",
      icon: "info",
      title: "FAQs",
      route: "/fournisseurSetting/faq",
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Aide & Assistance</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {helpItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.helpItem}
            onPress={() => router.push(item.route)}
          >
            <View style={styles.helpItemLeft}>
              <View style={styles.iconContainer}>
                <MaterialIcons name={item.icon} size={20} color="#1BB874" />
              </View>
              <Text style={styles.helpItemText}>{item.title}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#CCCCCC" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

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
    height: 120,
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
  helpItem: {
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
  helpItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  helpItemText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
  },
});

export default HelpCenterScreen;
