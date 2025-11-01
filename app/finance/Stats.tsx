import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function StatsDashboard() {
  const [revenuePeriod, setRevenuePeriod] = useState('Jan');
  const [expensePeriod, setExpensePeriod] = useState('Jan');

  const revenueData = [
    { month: 'Jan', revenue: 500, expense: 300 },
    { month: 'Fév', revenue: 700, expense: 400 },
    { month: 'Mar', revenue: 450, expense: 500 },
    { month: 'Avr', revenue: 600, expense: 350 },
    { month: 'Mai', revenue: 800, expense: 450 },
    { month: 'Jun', revenue: 700, expense: 400 },
    { month: 'Jul', revenue: 550, expense: 380 }
  ];

  const expenseData = [
    { month: 'Jan', invest: 200, returns: 150, other: 180 },
    { month: 'Fév', invest: 250, returns: 200, other: 150 },
    { month: 'Mar', invest: 300, returns: 180, other: 200 },
    { month: 'Avr', invest: 220, returns: 160, other: 170 },
    { month: 'Mai', invest: 280, returns: 220, other: 190 },
    { month: 'Jun', invest: 260, returns: 200, other: 180 },
    { month: 'Jul', invest: 240, returns: 190, other: 170 }
  ];

  const maxRevenue = 800;
  const maxExpense = 700;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Feather name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Statistiques</Text>
          <TouchableOpacity>
            <Feather name="more-vertical" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Cards */}
        <View style={styles.cardsContainer}>
          <View style={[styles.card, { backgroundColor: '#E8F5E9' }]}>
            <View style={styles.cardHeader}>
              <Feather name="trending-up" size={20} color="#4CAF50" />
              <Text style={styles.cardLabel}>Solde disponible</Text>
            </View>
            <Text style={styles.cardValue}>990 000,00 MAD</Text>
          </View>

          <View style={[styles.card, { backgroundColor: '#FFF9E6' }]}>
            <View style={styles.cardHeader}>
              <Feather name="pie-chart" size={20} color="#FFC107" />
              <Text style={styles.cardLabel}>En dépenses</Text>
            </View>
            <Text style={styles.cardValue}>990 000,00 MAD</Text>
          </View>
        </View>

        {/* Section Flux de trésorerie */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Flux de trésorerie</Text>
          
          <View style={styles.periodSelector}>
            <TouchableOpacity 
              style={[styles.periodButton, revenuePeriod === 'Jan' && styles.periodButtonActive]}
              onPress={() => setRevenuePeriod('Jan')}
            >
              <Text style={[styles.periodText, revenuePeriod === 'Jan' && styles.periodTextActive]}>
                Jan
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.periodButton}>
              <Text style={styles.periodText}>Mensuel</Text>
              <Feather name="chevron-down" size={16} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Chart */}
          <View style={styles.chart}>
            <View style={styles.yAxis}>
              <Text style={styles.axisLabel}>800K</Text>
              <Text style={styles.axisLabel}>600K</Text>
              <Text style={styles.axisLabel}>400K</Text>
              <Text style={styles.axisLabel}>200K</Text>
              <Text style={styles.axisLabel}>0</Text>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
              <View style={styles.barsContainer}>
                {revenueData.map((item, index) => {
                  const revenueHeight = (item.revenue / maxRevenue) * 200;
                  const expenseHeight = (item.expense / maxRevenue) * 200;
                  
                  return (
                    <View key={index} style={styles.barGroup}>
                      <View style={styles.bars}>
                        <View style={[styles.bar, styles.revenueBar, { height: revenueHeight }]}>
                          {item.month === 'Mai' && (
                            <View style={styles.tooltip}>
                              <Text style={styles.tooltipText}>800K</Text>
                            </View>
                          )}
                        </View>
                        <View style={[styles.bar, styles.expenseBar, { height: expenseHeight }]} />
                      </View>
                      <Text style={styles.monthLabel}>{item.month}</Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>Revenus</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
              <Text style={styles.legendText}>Dépenses</Text>
            </View>
          </View>
        </View>

        {/* Répartition des Revenus */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Répartition des Revenus</Text>
          
          <View style={styles.periodSelector}>
            <TouchableOpacity 
              style={[styles.periodButton, styles.periodButtonActive]}
            >
              <Text style={[styles.periodText, styles.periodTextActive]}>Jan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.periodButton}>
              <Text style={styles.periodText}>Mensuel</Text>
              <Feather name="chevron-down" size={16} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Donut Chart */}
          <View style={styles.donutContainer}>
            <View style={styles.donut}>
              <View style={[styles.donutSegment, { 
                backgroundColor: '#2196F3',
                width: 140,
                height: 140,
                borderRadius: 70
              }]} />
              <View style={[styles.donutSegment, { 
                backgroundColor: '#FF9800',
                width: 140,
                height: 70,
                borderTopLeftRadius: 70,
                borderTopRightRadius: 70,
                position: 'absolute',
                bottom: 0
              }]} />
              <View style={styles.donutCenter}>
                <Text style={styles.donutLabel}>Ce mois-ci</Text>
                <Text style={styles.donutValue}>239 990 000,00</Text>
              </View>
            </View>
          </View>

          <View style={styles.revenueItems}>
            <View style={styles.revenueItem}>
              <View style={styles.revenueItemHeader}>
                <View style={[styles.legendDot, { backgroundColor: '#2196F3' }]} />
                <Text style={styles.revenueItemLabel}>iPhone 14</Text>
              </View>
              <Text style={styles.revenueItemValue}>191 990 000,00 MAD</Text>
            </View>
            <View style={styles.revenueItem}>
              <View style={styles.revenueItemHeader}>
                <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
                <Text style={styles.revenueItemLabel}>iPhone 14 Pro</Text>
              </View>
              <Text style={styles.revenueItemValue}>47 190 000,00 MAD</Text>
            </View>
          </View>
        </View>

        {/* Répartition des dépenses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Répartition des dépenses</Text>
          
          <View style={styles.periodSelector}>
            <TouchableOpacity 
              style={[styles.periodButton, styles.periodButtonActive]}
            >
              <Text style={[styles.periodText, styles.periodTextActive]}>Jan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.periodButton}>
              <Text style={styles.periodText}>Mensuel</Text>
              <Feather name="chevron-down" size={16} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Stacked Bar Chart */}
          <View style={styles.chart}>
            <View style={styles.yAxis}>
              <Text style={styles.axisLabel}>800K</Text>
              <Text style={styles.axisLabel}>600K</Text>
              <Text style={styles.axisLabel}>400K</Text>
              <Text style={styles.axisLabel}>200K</Text>
              <Text style={styles.axisLabel}>0</Text>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
              <View style={styles.barsContainer}>
                {expenseData.map((item, index) => {
                  const investHeight = (item.invest / maxExpense) * 200;
                  const returnsHeight = (item.returns / maxExpense) * 200;
                  const otherHeight = (item.other / maxExpense) * 200;
                  
                  return (
                    <View key={index} style={styles.barGroup}>
                      <View style={styles.stackedBar}>
                        <View style={[styles.stackedSegment, { 
                          backgroundColor: '#F44336', 
                          height: investHeight 
                        }]}>
                          {item.month === 'Mai' && (
                            <View style={styles.tooltip}>
                              <Text style={styles.tooltipText}>700K</Text>
                            </View>
                          )}
                        </View>
                        <View style={[styles.stackedSegment, { 
                          backgroundColor: '#FFC107', 
                          height: returnsHeight 
                        }]} />
                        <View style={[styles.stackedSegment, { 
                          backgroundColor: '#FFE082', 
                          height: otherHeight 
                        }]} />
                      </View>
                      <Text style={styles.monthLabel}>{item.month}</Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          <View style={styles.expenseLegend}>
            <View style={styles.expenseItem}>
              <View style={styles.expenseItemHeader}>
                <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
                <Text style={styles.expenseItemLabel}>Investissements</Text>
              </View>
              <Text style={styles.expenseItemValue}>120 000,00 MAD</Text>
            </View>
            <View style={styles.expenseItem}>
              <View style={styles.expenseItemHeader}>
                <View style={[styles.legendDot, { backgroundColor: '#FFC107' }]} />
                <Text style={styles.expenseItemLabel}>Retours</Text>
              </View>
              <Text style={styles.expenseItemValue}>140 000,00 MAD</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  cardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
    backgroundColor: '#FFF',
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 12,
    color: '#666',
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  section: {
    backgroundColor: '#FFF',
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    gap: 4,
  },
  periodButtonActive: {
    backgroundColor: '#E8F5E9',
  },
  periodText: {
    fontSize: 14,
    color: '#666',
  },
  periodTextActive: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  chart: {
    flexDirection: 'row',
    height: 240,
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  axisLabel: {
    fontSize: 10,
    color: '#999',
  },
  chartScroll: {
    flex: 1,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 220,
    gap: 12,
    paddingBottom: 20,
  },
  barGroup: {
    alignItems: 'center',
    gap: 8,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 200,
  },
  bar: {
    width: 12,
    borderRadius: 4,
    position: 'relative',
  },
  revenueBar: {
    backgroundColor: '#4CAF50',
  },
  expenseBar: {
    backgroundColor: '#F44336',
  },
  stackedBar: {
    width: 20,
    flexDirection: 'column-reverse',
    height: 200,
    gap: 2,
  },
  stackedSegment: {
    width: '100%',
    borderRadius: 4,
    position: 'relative',
  },
  monthLabel: {
    fontSize: 10,
    color: '#999',
  },
  tooltip: {
    position: 'absolute',
    top: -25,
    left: -10,
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tooltipText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  donutContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  donut: {
    width: 180,
    height: 180,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutSegment: {
    position: 'absolute',
  },
  donutCenter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  donutLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  donutValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  revenueItems: {
    gap: 16,
    marginTop: 16,
  },
  revenueItem: {
    gap: 8,
  },
  revenueItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  revenueItemLabel: {
    fontSize: 14,
    color: '#666',
  },
  revenueItemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  expenseLegend: {
    gap: 16,
    marginTop: 16,
  },
  expenseItem: {
    gap: 8,
  },
  expenseItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expenseItemLabel: {
    fontSize: 14,
    color: '#666',
  },
  expenseItemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});