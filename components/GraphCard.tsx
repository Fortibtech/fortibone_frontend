import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

// Interface pour les données du graphique
export interface SalesData {
  id: string;
  title: string;
  amount: string;
  period: string;
  marketingData: number[];
  casesData: number[];
  months: string[];
}

interface GraphCardProps {
  salesData: SalesData;
  onPress?: (id: string) => void;
}

const GraphCard: React.FC<GraphCardProps> = ({ salesData, onPress }) => {
  const [focusIndex, setFocusIndex] = useState(3); // August par défaut
  const [showTooltip, setShowTooltip] = useState(false);

  // Fonction pour gérer le mouvement tactile
  const handleGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    const { x } = event.nativeEvent;
    const graphWidth = 280;
    const barWidth = 15;
    const barSpacing = 8;
    const groupSpacing = (graphWidth - (salesData.marketingData.length * (barWidth * 2 + barSpacing))) / (salesData.marketingData.length - 1);
    
    const newIndex = Math.max(0, Math.min(salesData.marketingData.length - 1, 
      Math.floor(x / (barWidth * 2 + barSpacing + groupSpacing))
    ));
    setFocusIndex(newIndex);
    setShowTooltip(true);
  };
  // Fonction pour créer le chemin SVG d'une courbe
  const createPath = (data: number[], width: number, height: number): string => {
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - minValue) / range) * height;
      return { x, y };
    });
    
    let path = `M${points[0].x},${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];
      
      // Créer une courbe lisse avec des points de contrôle
      const cpx1 = prevPoint.x + (currentPoint.x - prevPoint.x) / 3;
      const cpy1 = prevPoint.y;
      const cpx2 = currentPoint.x - (currentPoint.x - prevPoint.x) / 3;
      const cpy2 = currentPoint.y;
      
      path += ` C${cpx1},${cpy1} ${cpx2},${cpy2} ${currentPoint.x},${currentPoint.y}`;
    }
    
    return path;
  };

  const renderGraph = () => {
    const graphWidth = 280;
    const graphHeight = 220;
    
    const marketingPath = createPath(salesData.marketingData, graphWidth, graphHeight);
    const casesPath = createPath(salesData.casesData, graphWidth, graphHeight);
    
    // Point de focus dynamique
    const maxValue = Math.max(...salesData.marketingData, ...salesData.casesData);
    const minValue = Math.min(...salesData.marketingData, ...salesData.casesData);
    const range = maxValue - minValue || 1;
    
    const focusX = (focusIndex / (salesData.marketingData.length - 1)) * graphWidth;
    const marketingFocusY = graphHeight - ((salesData.marketingData[focusIndex] - minValue) / range) * graphHeight;
    const casesFocusY = graphHeight - ((salesData.casesData[focusIndex] - minValue) / range) * graphHeight;
    
    return (
      <View style={styles.graphWrapper}>
        {/* Tooltip avec valeurs */}
        {showTooltip && (
          <View style={[styles.tooltip, { left: focusX - 40 }]}>
            <Text style={styles.tooltipAmount}>${salesData.marketingData[focusIndex]}</Text>
            <Text style={styles.tooltipPeriod}>{salesData.months[focusIndex]}</Text>
          </View>
        )}
        
        <PanGestureHandler onGestureEvent={handleGestureEvent}>
          <View>
            <Svg width={graphWidth} height={graphHeight + 40} style={styles.svgContainer}>
              {/* Lignes de grille horizontales */}
              <Line x1="0" y1={graphHeight * 0.25} x2={graphWidth} y2={graphHeight * 0.25} stroke="#f0f0f0" strokeWidth="1" />
              <Line x1="0" y1={graphHeight * 0.5} x2={graphWidth} y2={graphHeight * 0.5} stroke="#f0f0f0" strokeWidth="1" />
              <Line x1="0" y1={graphHeight * 0.75} x2={graphWidth} y2={graphHeight * 0.75} stroke="#f0f0f0" strokeWidth="1" />
              
              {/* Courbe Cases Sales (verte) */}
              <Path
                d={casesPath}
                stroke="#00D4AA"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              
              {/* Courbe Marketing Sales (bleue) */}
              <Path
                d={marketingPath}
                stroke="#4F46E5"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              
              {/* Points interactifs invisibles */}
              {salesData.marketingData.map((_, index) => {
                const x = (index / (salesData.marketingData.length - 1)) * graphWidth;
                return (
                  <Circle 
                    key={index}
                    cx={x} 
                    cy={graphHeight / 2} 
                    r="15" 
                    fill="transparent"
                  />
                );
              })}
              
              {/* Ligne verticale et points de focus */}
              <Line x1={focusX} y1="0" x2={focusX} y2={graphHeight} stroke="#4F46E5" strokeWidth="2" strokeOpacity="0.7" />
              <Circle cx={focusX} cy={marketingFocusY} r="4" fill="#4F46E5" />
              <Circle cx={focusX} cy={casesFocusY} r="4" fill="#00D4AA" />
              
              {/* Labels des mois */}
              {salesData.months.map((month, index) => {
                const x = (index / (salesData.months.length - 1)) * graphWidth;
                return (
                  <SvgText
                    key={month}
                    x={x}
                    y={graphHeight + 20}
                    fill="#9CA3AF"
                    fontSize="12"
                    textAnchor="middle"
                  >
                    {month}
                  </SvgText>
                );
              })}
            </Svg>
          </View>
        </PanGestureHandler>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={styles.cardContainer}>
      <View style={styles.cardContent}>
        {/* Header avec légende */}
        <View style={styles.header}>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4F46E5' }]} />
              <Text style={styles.legendText}>Marketing Sales</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#00D4AA' }]} />
              <Text style={styles.legendText}>Cases Sales</Text>
            </View>
          </View>
        </View>

        {/* Graphique */}
        <View style={styles.graphContainer}>
          {/* Labels Y-axis */}
          <View style={styles.yAxisLabels}>
            <Text style={styles.axisLabel}>1k</Text>
            <Text style={styles.axisLabel}>800</Text>
            <Text style={styles.axisLabel}>600</Text>
            <Text style={styles.axisLabel}>400</Text>
            <Text style={styles.axisLabel}>200</Text>
            <Text style={styles.axisLabel}>0</Text>
          </View>
          
          <View style={styles.graphContent}>
            {renderGraph()}
          </View>
        </View>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
  },
  cardContent: {
    flex: 1,
  },
  header: {
    marginBottom: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  graphContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  yAxisLabels: {
    justifyContent: 'space-between',
    height: 220,
    paddingRight: 8,
    paddingTop: 4,
  },
  axisLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    minWidth: 24,
  },
  graphContent: {
    flex: 1,
    alignItems: 'center',
  },
  graphWrapper: {
    position: 'relative',
  },
  svgContainer: {
    overflow: 'visible',
  },
  tooltip: {
    position: 'absolute',
    top: -60,
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    minWidth: 80,
    zIndex: 1000,
  },
  tooltipAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  tooltipPeriod: {
    fontSize: 12,
    color: '#D1D5DB',
  },
});

// Exemple d'utilisation
const ExampleUsage = () => {
  const sampleData: SalesData = {
    id: '1',
    title: 'Sales Chart',
    amount: '$27632',
    period: 'August',
    marketingData: [500, 520, 480, 600, 550, 450],
    casesData: [600, 580, 650, 750, 700, 580],
    months: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
  };

  const handlePress = (id: string) => {
    console.log('Graph card pressed:', id);
  };

  return (
    <GraphCard 
      salesData={sampleData} 
      onPress={handlePress}
    />
  );
};

export default GraphCard;