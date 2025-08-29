import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';

// Interface pour les données du dashboard
export interface AnalyticsData {
  year: number;
  totalVisitors: number;
  visitorsLabel: string;
  platforms: {
    name: string;
    visitors: string;
    color: string;
    percentage: number;
  }[];
  topLocation: {
    country: string;
    flag: string;
    visitors: string;
    description: string;
  };
  salesCategories: {
    name: string;
    visitors: string;
    color: string;
    size: 'massive' | 'large' | 'medium' | 'small';
  }[];
}

// Composant pour le sélecteur d'année
const YearSelector: React.FC<{ year: number; onYearChange: (year: number) => void }> = ({ 
  year, 
  onYearChange 
}) => {
  return (
    <View style={styles.yearSelector}>
      <TouchableOpacity 
        style={styles.yearArrow}
        onPress={() => onYearChange(year - 1)}
      >
        <Text style={styles.arrowText}>‹</Text>
      </TouchableOpacity>
      <Text style={styles.yearText}>{year}</Text>
      <TouchableOpacity 
        style={styles.yearArrow}
        onPress={() => onYearChange(year + 1)}
      >
        <Text style={styles.arrowText}>›</Text>
      </TouchableOpacity>
    </View>
  );
};

// Composant pour le graphique circulaire
const CircularChart: React.FC<{ 
  totalVisitors: number; 
  label: string; 
  platforms: AnalyticsData['platforms'] 
}> = ({ totalVisitors, label, platforms }) => {
  const size = 200;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  let cumulativePercentage = 0;

  return (
    <View style={styles.chartContainer}>
      <View style={styles.circularChart}>
        <Svg width={size} height={size}>
          {/* Cercle de fond */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#F3F4F6"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Segments colorés */}
          {platforms.map((platform, index) => {
            const strokeDasharray = circumference;
            const strokeDashoffset = circumference - (platform.percentage / 100) * circumference;
            const rotation = (cumulativePercentage / 100) * 360 - 90;
            
            cumulativePercentage += platform.percentage;
            
            return (
              <Circle
                key={platform.name}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={platform.color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
              />
            );
          })}
        </Svg>
        
        {/* Texte central */}
        <View style={styles.chartCenter}>
          <Text style={styles.visitorCount}>{totalVisitors.toLocaleString()}</Text>
          <Text style={styles.visitorLabel}>{label}</Text>
        </View>
      </View>
      
      {/* Légende */}
      <View style={styles.platformLegend}>
        {platforms.map((platform, index) => (
          <View key={platform.name} style={styles.platformItem}>
            <View style={[styles.platformDot, { backgroundColor: platform.color }]} />
            <Text style={styles.platformName}>{platform.name}</Text>
            <Text style={styles.platformVisitors}>{platform.visitors}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Composant pour la carte du monde simplifiée
const WorldMap: React.FC = () => {
    return (
      <View style={styles.mapContainer}>
        <Svg width={320} height={180} viewBox="0 0 320 180">
          {/* Fond de carte en gris clair */}
          <Rect width="320" height="180" fill="#F3F4F6" />
          
          {/* Alaska - Bleu foncé */}
          <Path
            d="M15,45 L25,40 L35,42 L40,48 L35,55 L25,58 L18,55 L12,50 Z"
            fill="#4F46E5"
          />
          
          {/* Canada - Gris */}
          <Path
            d="M25,35 L85,25 L95,30 L100,35 L95,45 L85,50 L70,48 L50,45 L35,42 Z"
            fill="#D1D5DB"
          />
          
          {/* États-Unis - Bleu foncé avec label */}
          <Path
            d="M35,50 L95,45 L100,50 L98,65 L90,70 L75,72 L60,70 L45,68 L38,60 Z"
            fill="#4F46E5"
          />
          
          {/* Mexique - Jaune */}
          <Path
            d="M45,72 L75,70 L80,75 L78,82 L70,85 L55,83 L48,78 Z"
            fill="#EAB308"
          />
          
          {/* Amérique Centrale - Jaune */}
          <Path
            d="M65,83 L75,82 L78,88 L76,92 L70,90 L67,87 Z"
            fill="#EAB308"
          />
          
          {/* Brésil - Gris */}
          <Path
            d="M75,95 L95,92 L105,98 L110,115 L105,130 L95,135 L85,132 L78,125 L75,110 Z"
            fill="#D1D5DB"
          />
          
          {/* Argentine - Gris */}
          <Path
            d="M80,135 L95,132 L98,145 L95,160 L88,165 L82,160 L80,150 Z"
            fill="#D1D5DB"
          />
          
          {/* Colombie/Venezuela - Jaune */}
          <Path
            d="M70,90 L85,88 L90,95 L88,105 L82,110 L75,108 L72,100 Z"
            fill="#EAB308"
          />
          
          {/* Groenland - Gris */}
          <Path
            d="M105,15 L125,12 L135,18 L132,28 L125,32 L115,30 L108,25 Z"
            fill="#D1D5DB"
          />
          
          {/* Islande - Gris */}
          <Path
            d="M125,35 L135,33 L138,38 L135,42 L130,40 L127,37 Z"
            fill="#D1D5DB"
          />
          
          {/* Royaume-Uni - Orange */}
          <Path
            d="M140,45 L148,43 L152,48 L150,52 L145,50 L142,47 Z"
            fill="#F97316"
          />
          
          {/* Europe du Nord - Orange */}
          <Path
            d="M148,40 L165,38 L175,42 L172,50 L165,52 L155,50 L150,45 Z"
            fill="#F97316"
          />
          
          {/* Europe de l'Ouest - Orange */}
          <Path
            d="M145,52 L165,50 L168,58 L165,65 L155,67 L148,65 L145,58 Z"
            fill="#F97316"
          />
          
          {/* Europe de l'Est - Orange */}
          <Path
            d="M165,42 L185,40 L195,45 L192,55 L185,58 L175,56 L168,52 Z"
            fill="#F97316"
          />
          
          {/* Russie occidentale - Gris */}
          <Path
            d="M185,25 L220,22 L235,28 L232,42 L225,45 L200,47 L190,42 Z"
            fill="#D1D5DB"
          />
          
          {/* Afrique du Nord - Gris */}
          <Path
            d="M145,70 L175,68 L185,72 L182,85 L175,88 L160,86 L150,83 L145,78 Z"
            fill="#D1D5DB"
          />
          
          {/* Afrique de l'Ouest - Gris */}
          <Path
            d="M140,85 L165,83 L168,95 L165,105 L158,108 L148,106 L142,100 L140,92 Z"
            fill="#D1D5DB"
          />
          
          {/* Afrique de l'Est - Gris */}
          <Path
            d="M175,85 L190,83 L195,95 L192,110 L185,115 L175,112 L172,100 Z"
            fill="#D1D5DB"
          />
          
          {/* Afrique du Sud - Gris */}
          <Path
            d="M155,115 L185,112 L188,125 L185,135 L175,138 L165,136 L158,130 Z"
            fill="#D1D5DB"
          />
          
          {/* Moyen-Orient - Orange */}
          <Path
            d="M185,65 L205,63 L212,70 L210,80 L202,83 L190,81 L185,75 Z"
            fill="#F97316"
          />
          
          {/* Inde - Jaune */}
          <Path
            d="M220,75 L240,73 L248,85 L245,100 L238,105 L228,103 L222,95 Z"
            fill="#EAB308"
          />
          
          {/* Chine - Jaune */}
          <Path
            d="M240,45 L270,42 L280,48 L278,65 L270,70 L250,68 L242,60 Z"
            fill="#EAB308"
          />
          
          {/* Asie du Sud-Est - Jaune */}
          <Path
            d="M250,75 L275,73 L285,85 L282,95 L275,98 L265,96 L255,90 Z"
            fill="#EAB308"
          />
          
          {/* Indonésie - Jaune */}
          <Path
            d="M260,100 L285,98 L295,105 L292,115 L285,118 L270,116 L262,110 Z"
            fill="#EAB308"
          />
          
          {/* Australie - Jaune */}
          <Path
            d="M270,130 L300,128 L310,135 L308,150 L300,155 L285,153 L275,148 L270,140 Z"
            fill="#EAB308"
          />
          
          {/* Nouvelle-Zélande - Jaune */}
          <Path
            d="M305,155 L312,153 L315,160 L312,167 L308,165 L305,162 Z"
            fill="#EAB308"
          />
          
          {/* Japon - Jaune */}
          <Path
            d="M285,55 L295,53 L298,60 L296,67 L290,65 L287,60 Z"
            fill="#EAB308"
          />
          
          {/* Label États-Unis */}
          <G>
            <Rect x="55" y="58" width="60" height="18" rx="9" fill="#1F2937" />
            <SvgText x="85" y="70" fill="#FFFFFF" fontSize="10" textAnchor="middle" fontWeight="500">
              United States
            </SvgText>
          </G>
        </Svg>
      </View>
    );
  };

// Composant principal du dashboard
const AnalyticsDashboard: React.FC<{ data: AnalyticsData }> = ({ data }) => {
  const [currentYear, setCurrentYear] = useState(data.year);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Sélecteur d'année */}
      <YearSelector year={currentYear} onYearChange={setCurrentYear} />
      
      {/* Graphique circulaire */}
      <CircularChart 
        totalVisitors={data.totalVisitors}
        label={data.visitorsLabel}
        platforms={data.platforms}
      />
      
      {/* Carte du monde */}
      <WorldMap />
      
      {/* Section Top Retail Sales Locations */}
      <View style={styles.locationsSection}>
        <Text style={styles.sectionTitle}>Top Retail Sales Locations</Text>
        
        <View style={styles.topLocationCard}>
          <View style={styles.topLocationInfo}>
            <Text style={styles.topLocationNumber}>{data.topLocation.visitors}</Text>
            <Text style={styles.flagIcon}>{data.topLocation.flag}</Text>
          </View>
          <Text style={styles.topLocationDescription}>{data.topLocation.description}</Text>
          
          {/* Boutons zoom */}
          <View style={styles.zoomButtons}>
            <TouchableOpacity style={styles.zoomButton}>
              <Text style={styles.zoomButtonText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton}>
              <Text style={styles.zoomButtonText}>−</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Liste des catégories */}
        <View style={styles.categoriesList}>
          {data.salesCategories.map((category, index) => (
            <View key={category.name} style={styles.categoryItem}>
              <View style={styles.categoryLeft}>
                <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                <Text style={styles.categoryName}>{category.name}</Text>
              </View>
              <Text style={styles.categoryVisitors}>{category.visitors}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  yearSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  yearArrow: {
    padding: 12,
  },
  arrowText: {
    fontSize: 24,
    color: '#6B7280',
    fontWeight: '300',
  },
  yearText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginHorizontal: 40,
  },
  chartContainer: {
    borderRadius: 16,
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 30,
    
  },
  circularChart: {
    position: 'relative',
    marginBottom: 30,
  },
  chartCenter: {
    position: 'absolute',
    top: '50%',
    left: '30%',
    // right: '50%',
    transform: [{ translateX: -50 }, { translateY: -30 }],
    alignItems: 'center',
  },
  visitorCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  visitorLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  platformLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    gap: 4,
  },
  platformItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
    marginBottom: 12,
  },
  platformDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  platformName: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  platformVisitors: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  mapContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 16,
    // backgroundColor: 'blue'
  },
  locationsSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  topLocationCard: {
    marginBottom: 24,
    position: 'relative',
  },
  topLocationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  topLocationNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginRight: 12,
  },
  flagIcon: {
    fontSize: 24,
  },
  topLocationDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  zoomButtons: {
    position: 'absolute',
    right: 0,
    top: 0,
    gap: 8,
  },
  zoomButton: {
    width: 32,
    height: 32,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  zoomButtonText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '300',
  },
  categoriesList: {
    gap: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    color: '#111827',
  },
  categoryVisitors: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});

export default AnalyticsDashboard;