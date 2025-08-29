import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect, Text as SvgText } from 'react-native-svg';

// Interface pour les données du dashboard
export interface DashboardData {
  hitRate: number;
  deals: number;
  visitors: number;
  visitorsChange: number;
  onlineSales: number[];
  offlineSales: number[];
  months: string[];
  year: string;
}

interface StatCardProps {
  percentage: number;
  label: string;
  color: string;
  icon: 'target' | 'briefcase';
}

// Composant pour les cartes de statistiques circulaires
const StatCard: React.FC<StatCardProps> = ({ percentage, label, color, icon }) => {
  const size = 60;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const renderIcon = () => {
    if (icon === 'target') {
      return (
        <Circle cx={size/2} cy={size/2} r="8" fill="none" stroke={color} strokeWidth="2">
          <Circle cx={size/2} cy={size/2} r="4" fill={color} />
        </Circle>
      );
    } else {
      return (
        <Rect x={size/2 - 8} y={size/2 - 6} width="16" height="12" fill="none" stroke={color} strokeWidth="2" rx="2">
          <Path d={`M${size/2 - 4},${size/2 - 6} L${size/2 + 4},${size/2 - 6}`} stroke={color} strokeWidth="2" />
        </Rect>
      );
    }
  };

  return (
    <View style={styles.statCard}>
      <View style={styles.circularProgress}>
        <Svg width={size} height={size}>
          {/* Cercle de fond */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Cercle de progression */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          {/* Icône centrale */}
          {renderIcon()}
        </Svg>
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statPercentage}>{percentage}%</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
};

// Composant pour la métrique des visiteurs
const VisitorMetric: React.FC<{ visitors: number; change: number }> = ({ visitors, change }) => {
  const isPositive = change > 0;
  
  // Données pour la mini courbe
  const miniChartData = [3, 2, 4, 3, 5, 4, 6, 5];
  const chartWidth = 120;
  const chartHeight = 50;
  
  const createMiniPath = () => {
    const points = miniChartData.map((value, index) => ({
      x: (index / (miniChartData.length - 1)) * chartWidth,
      y: chartHeight - (value / 6) * chartHeight
    }));
    
    let path = `M${points[0].x},${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];
      
      const cpx1 = prevPoint.x + (currentPoint.x - prevPoint.x) / 3;
      const cpy1 = prevPoint.y;
      const cpx2 = currentPoint.x - (currentPoint.x - prevPoint.x) / 3;
      const cpy2 = currentPoint.y;
      
      path += ` C${cpx1},${cpy1} ${cpx2},${cpy2} ${currentPoint.x},${currentPoint.y}`;
    }
    
    return path;
  };

  return (
    <View style={styles.visitorCard}>
      <View style={styles.visitorInfo}>
        
        <View style={styles.changeContainer}><Text style={styles.visitorNumber}>{visitors.toLocaleString()}</Text>
          <Text style={[styles.changeText, { color: isPositive ? '#EF4444' : '#10B981' }]}>
            {change}% {isPositive ? '↓' : '↑'}
          </Text>
        </View>
        <Text style={styles.visitorLabel}>Visitors this year</Text>
      </View>
      <View style={styles.miniChart}>
        <Svg width={chartWidth} height={chartHeight}>
          <Path
            d={createMiniPath()}
            stroke="#0062FF"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Points sur la courbe */}
          {miniChartData.map((value, index) => {
            const x = (index / (miniChartData.length - 1)) * chartWidth;
            const y = chartHeight - (value / 6) * chartHeight;
            return (
              <Circle key={index} cx={x} cy={y} r="2" fill="#0062FF" />
            );
          })}
        </Svg>
      </View>
    </View>
  );
};

// Composant principal du dashboard
const SalesDashboard: React.FC<{ data: DashboardData }> = ({ data }) => {
  const renderBarChart = () => {
    const chartWidth = 280;
    const chartHeight = 300;
    const barWidth = 10;
    const barSpacing = 8;
    const groupSpacing = (chartWidth - (data.months.length * (barWidth * 2 + barSpacing))) / (data.months.length - 1);
    
    const maxValue = Math.max(...data.onlineSales, ...data.offlineSales);
    const yAxisValues = ['$0', '$250', '$500', '$750', '$1k'];
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Sales Report</Text>
            <Text style={styles.chartSubtitle}>{data.year}</Text>
        </View>
        
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#0062FF' }]} />
            <Text style={styles.legendText}>Online Sales</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Offline Sales</Text>
          </View>
        </View>
        
        <View style={styles.chartContent}>
          <View style={styles.yAxis}>
            {yAxisValues.reverse().map((value, index) => (
              <Text key={index} style={styles.yAxisLabel}>{value}</Text>
            ))}
          </View>
          
          <View style={styles.chartSvg}>
            <Svg width={chartWidth} height={chartHeight + 30}>
              {/* Lignes de grille */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                <Rect
                  key={index}
                  x="0"
                  y={chartHeight * ratio}
                  width={chartWidth}
                  height="1"
                  fill="#F3F4F6"
                />
              ))}
              
              {/* Barres */}
              {data.months.map((month, index) => {
                const onlineValue = data.onlineSales[index];
                const offlineValue = data.offlineSales[index];
                const x = index * (barWidth * 2 + barSpacing + groupSpacing);
                
                const onlineHeight = (onlineValue / maxValue) * chartHeight;
                const offlineHeight = (offlineValue / maxValue) * chartHeight;
                
                return (
                  <React.Fragment key={month}>
                    {/* Barre Online (bleue) */}
                    <Rect
                      x={x}
                      y={chartHeight - onlineHeight}
                      width={barWidth}
                      height={onlineHeight}
                      fill="#0062FF"
                      rx="4"
                      ry="4"
                    />
                    
                    {/* Barre Offline (verte) */}
                    <Rect
                      x={x + barWidth + barSpacing}
                      y={chartHeight - offlineHeight}
                      width={barWidth}
                      height={offlineHeight}
                      fill="#10B981"
                      rx="4"
                      ry="4"
                    />
                  </React.Fragment>
                );
              })}
              
              {/* Labels des mois */}
              {data.months.map((month, index) => {
                const x = index * (barWidth * 2 + barSpacing + groupSpacing) + barWidth;
                return (
                  <SvgText
                    key={month}
                    x={x}
                    y={chartHeight + 20}
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
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Statistiques en haut */}
      <View style={styles.statsRow}>
        <StatCard 
          percentage={data.hitRate} 
          label="Hit Rate this year" 
          color="#4F46E5" 
          icon="target"
        />
        <StatCard 
          percentage={data.deals} 
          label="Deals this year" 
          color="#10B981" 
          icon="briefcase"
        />
      </View>
      
      {/* Métrique des visiteurs */}
      <VisitorMetric visitors={data.visitors} change={data.visitorsChange} />
      
      {/* Graphique en barres */}
      {renderBarChart()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  circularProgress: {
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 16,
  },
  visitorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  visitorInfo: {
    flex: 1,
  },
  visitorNumber: {
    fontSize: 32,
    marginRight: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  visitorLabel: {
    fontSize: 20,
    color: '#6B7280',
  },
  miniChart: {
    marginLeft: 20,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,paddingRight: 16,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 22,
    color: '#6B7280',
  },
  chartContent: {
    flexDirection: 'row',
  },
  yAxis: {
    justifyContent: 'space-between',
    height: 300,
    paddingRight: 12,
    paddingTop: 4,
  },
  yAxisLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  chartSvg: {
    flex: 1,
  },
});



export default SalesDashboard;