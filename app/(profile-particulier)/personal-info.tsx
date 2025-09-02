// app/(profile-particulier)/personal-info.tsx
import React from "react";
import { StyleSheet, ScrollView, View } from "react-native";

import ProtectedRoute from "@/components/ProtectedRoute";
import PersonalInfos from "@/components/PersonalInfo";
import BackButton from "@/components/BackButton";

const PersonalInfo = () => {
  return (
    <ProtectedRoute>
      <View style={styles.header}>
        <BackButton />
      </View>
      <ScrollView>
        <PersonalInfos />
      </ScrollView>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 80,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginTop: 10,
    paddingLeft: 20,
  },
});

export default PersonalInfo;
