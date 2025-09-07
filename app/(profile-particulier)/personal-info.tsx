import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import ProtectedRoute from "@/components/ProtectedRoute";
import PersonalInfos from "@/components/PersonalInfo";
import BackButton from "@/components/BackButton";

// Responsive dimensions
const { width } = Dimensions.get("window");
const isTablet = width >= 600;

const PersonalInfo = () => {
  const [fadeAnim] = useState(new Animated.Value(0)); // Animation pour fade-in

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <Animated.View style={[styles.contentWrapper, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <BackButton size={isTablet ? 50 : 45} />
            </View>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Informations personnelles
            </Text>
            <View style={styles.headerRight} />
          </View>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <PersonalInfos />
          </ScrollView>
        </Animated.View>
      </View>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  contentWrapper: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.04,
    paddingVertical: 40,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    minHeight: 60,
  },
  headerLeft: {
    flex: 0,
    justifyContent: "center",
  },
  headerRight: {
    flex: 1,
  },
  headerTitle: {
    flex: 2,
    fontSize: isTablet ? 22 : 18,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 120,
  },
});

export default PersonalInfo;
