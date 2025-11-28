import { TopSellingProduct } from "@/api/analytics";
import React from "react";
import { Dimensions, Text, View } from "react-native";
import { PieChart } from "react-native-chart-kit";
// import type { TopSellingProduct } from "../types/sales"; // adapte le chemin

interface SalesPieChartProps {
  data: TopSellingProduct[];
  metric?: "totalQuantitySold" | "totalRevenue";
}

const screenWidth = Dimensions.get("window").width;

// ✅ Couleurs pour les parts du camembert
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8854d0"];

const SalesPieChart: React.FC<SalesPieChartProps> = ({
  data,
  metric = "totalQuantitySold",
}) => {
  // 🔄 Transformation des données
  const chartData = data.map((item, index) => ({
    name: item.productName,
    population:
      metric === "totalQuantitySold"
        ? item.totalQuantitySold
        : item.totalRevenue,
    color: COLORS[index % COLORS.length],
    legendFontColor: "#333",
    legendFontSize: 12,
  }));

  return (
    <View>
      <Text
        style={{
          textAlign: "center",
          fontSize: 16,
          fontWeight: "bold",
          marginBottom: 10,
        }}
      >
        {metric === "totalQuantitySold"
          ? "Quantité vendue par produit"
          : "Revenus générés par produit"}
      </Text>

      <PieChart
        data={chartData}
        width={screenWidth - 20}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute // 👈 pour afficher les valeurs absolues
      />
    </View>
  );
};

export default SalesPieChart;
