import { SalesByProductCategory } from "@/api/analytics";
import React from "react";
import { Dimensions, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";

interface SalesBarChartProps {
  data: SalesByProductCategory[];
  metric?: "totalItemsSold" | "totalRevenue";
}

const screenWidth = Dimensions.get("window").width;
const SalesBarChart: React.FC<SalesBarChartProps> = ({
  data,
  metric = "totalItemsSold",
}) => {
  // 🔄 Prépare les labels et valeurs
  const labels = data.map((item) => item.categoryName);
  const values = data.map((item) =>
    metric === "totalItemsSold" ? item.totalItemsSold : item.totalRevenue
  );

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
        {metric === "totalItemsSold"
          ? "Nombre de produits vendus par catégorie"
          : "Revenus par catégorie"}
      </Text>

      <BarChart
        data={{
          labels,
          datasets: [{ data: values }],
        }}
        width={screenWidth - 20}
        height={250}
        yAxisLabel={metric === "totalRevenue" ? "€" : ""}
        yAxisSuffix="" // 👈 ajoute ceci pour corriger l'erreur
        chartConfig={{
          backgroundColor: "#ffffff",
          backgroundGradientFrom: "#f5f5f5",
          backgroundGradientTo: "#e0e0e0",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: { borderRadius: 12 },
        }}
        verticalLabelRotation={30}
        fromZero
        showValuesOnTopOfBars
      />
    </View>
  );
};

export default SalesBarChart;
