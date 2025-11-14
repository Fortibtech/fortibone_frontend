"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { useRouter } from "expo-router"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"

interface FAQItem {
  id: string
  question: string
  answer: string
}

const FAQ: React.FC = () => {
  const router = useRouter()
  const [expandedId, setExpandedId] = useState<string>("faq1")

  const faqItems: FAQItem[] = [
    {
      id: "faq1",
      question: "Comment fonctionne la période d'essai gratuit ?",
      answer:
        "Profitez de 7 jours d'essai gratuit pour explorer toutes les fonctionnalités Premium. Aucun engagement n'est requis pendant cette période. À la fin des 7 jours, votre abonnement démarre automatiquement et le premier paiement est prélevé. Vous pouvez annuler à tout moment pendant l'essai sans frais.",
    },
    {
      id: "faq2",
      question: "Comment gérer plusieurs commerces avec un seul compte ?",
      answer: "Description de la réponse pour gérer plusieurs commerces...",
    },
    {
      id: "faq3",
      question: "Comment trouver et collaborer avec des fournisseurs sur la plateforme ?",
      answer: "Description de la réponse pour collaborer avec des fournisseurs...",
    },
    {
      id: "faq4",
      question: "Que se passe-t-il avec mes données si je résilié mon abonnement ?",
      answer: "Description de la réponse concernant les données...",
    },
    {
      id: "faq5",
      question: "Quelles sont les principales différences entre les forfaits Gratuit et Premium ?",
      answer: "Description des différences entre les forfaits...",
    },
    {
      id: "faq6",
      question: "Comment suivre les commandes et gérer les livraisons ?",
      answer: "Description du suivi des commandes et livraisons...",
    },
  ]

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? "" : id)
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.arrowBack} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQs</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {faqItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.faqItem} onPress={() => toggleExpand(item.id)}>
            <View style={styles.questionContainer}>
              <Text style={styles.question} numberOfLines={expandedId === item.id ? undefined : 1}>
                {item.question}
              </Text>
              <MaterialIcons name={expandedId === item.id ? "expand-less" : "expand-more"} size={24} color="#000000" />
            </View>
            

            {expandedId === item.id && <Text style={styles.answer}>{item.answer}</Text>}
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
  faqItem: {
    // flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginVertical: 8,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    // borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  questionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  question: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    flex: 1,
    marginRight: 12,
  },
  answer: {
    fontSize: 13,
    color: "#666666",
    marginTop: 12,
    lineHeight: 18,
  },
  arrowBack: {
      borderWidth: 1,
    borderRadius: 50,
    borderColor: '#F8F1F1FF',
    padding: 5,
  }
})

export default FAQ
