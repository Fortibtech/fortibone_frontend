import { SalesByPeriod } from "@/api/analytics";
import React, { useEffect, useState } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";
import LineChart from "react-native-chart-kit/dist/line-chart";

interface Props {
  data: SalesByPeriod[];
}

const windowWidth = Dimensions.get("window").width;
const chartMargin = windowWidth > 600 ? 24 : 16;
const chartPadding = windowWidth > 600 ? 24 : 16;
const screenWidth = windowWidth - 2 * chartMargin - 2 * chartPadding;

export const SalesByPeriodChart: React.FC<Props> = ({ data }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [translateYAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 20, // Simulates descending graph
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, translateYAnim]);

  if (!data || data.length === 0) {
    return (
      <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.emptyGraphBar,
            {
              transform: [{ translateY: translateYAnim }],
            },
          ]}
        />
        <Text style={styles.emptyText}>Aucune donnée disponible</Text>
      </Animated.View>
    );
  }

  const labels = data.map((item) => item.period);
  const totalAmounts = data.map((item) => item.totalAmount);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Text style={styles.title}>Évolution des ventes</Text>
      <View style={styles.chartWrapper}>
        <LineChart
          data={{
            labels,
            datasets: [{ data: totalAmounts }],
          }}
          width={screenWidth}
          height={220}
          yAxisLabel="€"
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#f0f4f8",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(34, 128, 176, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(33, 33, 33, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: {
              r: "5",
              strokeWidth: "2",
              stroke: "#1a6b99",
            },
            propsForBackgroundLines: {
              stroke: "#e0e0e0",
              strokeDasharray: "4,4",
            },
            propsForLabels: {
              fontSize: 10, // Smaller font for better fit
            },
          }}
          bezier
          style={styles.chart}
          withShadow={true}
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          xLabelsOffset={-15} // Pull x-axis labels inward
          yLabelsOffset={-15} // Pull y-axis labels inward
          fromZero={true} // Ensure chart starts at zero for better visibility
          decorator={() => {
            return (
              <View style={styles.decoratorContainer}>
                {totalAmounts.map((value, index) => (
                  <Animated.Text
                    key={index}
                    style={[
                      styles.dataPointLabel,
                      {
                        opacity: fadeAnim,
                        transform: [{ translateY: -15 }], // Position labels above dots
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {value.toFixed(2)}€
                  </Animated.Text>
                ))}
              </View>
            );
          }}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: chartMargin,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: chartPadding,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: windowWidth > 600 ? 18 : 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#212121",
  },
  chartWrapper: {
    overflow: "hidden",
    borderRadius: 16,
  },
  chart: {
    borderRadius: 16,
    paddingRight: 0,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: windowWidth > 600 ? 32 : 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    margin: windowWidth > 600 ? 24 : 16,
  },
  emptyText: {
    fontSize: windowWidth > 600 ? 16 : 14,
    color: "#757575",
    marginTop: 8,
  },
  dataPointLabel: {
    fontSize: 10,
    color: "#1a6b99",
    fontWeight: "500",
    textAlign: "center",
  },
  decoratorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyGraphBar: {
    width: 100,
    height: 50,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    marginBottom: 8,
  },
});
