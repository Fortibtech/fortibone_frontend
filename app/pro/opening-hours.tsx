import { BusinessesService, OpeningHour, UpdateOpeningHoursData } from '@/api';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface DaySchedule {
  dayOfWeek: string;
  dayLabel: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

const DAYS_OF_WEEK = [
  { key: 'MONDAY', label: 'Lundi' },
  { key: 'TUESDAY', label: 'Mardi' },
  { key: 'WEDNESDAY', label: 'Mercredi' },
  { key: 'THURSDAY', label: 'Jeudi' },
  { key: 'FRIDAY', label: 'Vendredi' },
  { key: 'SATURDAY', label: 'Samedi' },
  { key: 'SUNDAY', label: 'Dimanche' },
];

const OpeningHoursScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState<'open' | 'close'>('open');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [tempTime, setTempTime] = useState(new Date());

  useEffect(() => {
    initializeSchedule();
  }, []);

  const initializeSchedule = () => {
    const defaultSchedule: DaySchedule[] = DAYS_OF_WEEK.map(day => ({
      dayOfWeek: day.key,
      dayLabel: day.label,
      isOpen: day.key !== 'SUNDAY', // Fermé le dimanche par défaut
      openTime: '09:00',
      closeTime: '18:00'
    }));
    
    setSchedule(defaultSchedule);
    setLoading(false);
  };

  const toggleDayOpen = (index: number) => {
    setSchedule(prev => prev.map((day, i) => 
      i === index ? { ...day, isOpen: !day.isOpen } : day
    ));
  };

  const showTimePickerModal = (dayIndex: number, mode: 'open' | 'close') => {
    const day = schedule[dayIndex];
    const timeString = mode === 'open' ? day.openTime : day.closeTime;
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    
    setSelectedDayIndex(dayIndex);
    setTimePickerMode(mode);
    setTempTime(date);
    setShowTimePicker(true);
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    
    if (selectedTime) {
      const timeString = `${selectedTime.getHours().toString().padStart(2, '0')}:${selectedTime.getMinutes().toString().padStart(2, '0')}`;
      
      setSchedule(prev => prev.map((day, index) => {
        if (index === selectedDayIndex) {
          return {
            ...day,
            [timePickerMode === 'open' ? 'openTime' : 'closeTime']: timeString
          };
        }
        return day;
      }));
    }
  };

  const validateSchedule = () => {
    for (const day of schedule) {
      if (day.isOpen) {
        const openTime = new Date(`2000-01-01T${day.openTime}:00`);
        const closeTime = new Date(`2000-01-01T${day.closeTime}:00`);
        
        if (closeTime <= openTime) {
          Alert.alert(
            'Erreur de validation',
            `L'heure de fermeture doit être après l'heure d'ouverture pour ${day.dayLabel}`
          );
          return false;
        }
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateSchedule()) {
      return;
    }

    try {
      setSaving(true);
      
      const openingHours: OpeningHour[] = schedule
        .filter(day => day.isOpen)
        .map(day => ({
          dayOfWeek: day.dayOfWeek as any,
          openTime: day.openTime,
          closeTime: day.closeTime
        }));

      const data: UpdateOpeningHoursData = { hours: openingHours };
      
      await BusinessesService.updateOpeningHours(id, data);
      Alert.alert('Succès', 'Horaires d\'ouverture mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les horaires');
    } finally {
      setSaving(false);
    }
  };

  const copyToAllDays = (sourceIndex: number) => {
    const sourceDay = schedule[sourceIndex];
    if (!sourceDay.isOpen) {
      Alert.alert('Information', 'Impossible de copier les horaires d\'un jour fermé');
      return;
    }

    Alert.alert(
      'Copier les horaires',
      `Copier les horaires de ${sourceDay.dayLabel} (${sourceDay.openTime} - ${sourceDay.closeTime}) vers tous les autres jours ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Copier',
          onPress: () => {
            setSchedule(prev => prev.map(day => ({
              ...day,
              isOpen: true,
              openTime: sourceDay.openTime,
              closeTime: sourceDay.closeTime
            })));
          }
        }
      ]
    );
  };

  const renderDaySchedule = (day: DaySchedule, index: number) => (
    <View key={day.dayOfWeek} style={styles.dayContainer}>
      <View style={styles.dayHeader}>
        <Text style={styles.dayLabel}>{day.dayLabel}</Text>
        <View style={styles.dayActions}>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => copyToAllDays(index)}
            disabled={!day.isOpen}
          >
            <Ionicons 
              name="copy-outline" 
              size={20} 
              color={day.isOpen ? "#059669" : "#ccc"} 
            />
          </TouchableOpacity>
          <Switch
            value={day.isOpen}
            onValueChange={() => toggleDayOpen(index)}
            trackColor={{ false: '#e0e0e0', true: '#b8e8d1' }}
            thumbColor={day.isOpen ? '#059669' : '#f4f3f4'}
          />
        </View>
      </View>

      {day.isOpen && (
        <View style={styles.timeContainer}>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => showTimePickerModal(index, 'open')}
          >
            <Text style={styles.timeLabel}>Ouverture</Text>
            <Text style={styles.timeValue}>{day.openTime}</Text>
          </TouchableOpacity>

          <View style={styles.timeSeparator}>
            <Text style={styles.timeSeparatorText}>à</Text>
          </View>

          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => showTimePickerModal(index, 'close')}
          >
            <Text style={styles.timeLabel}>Fermeture</Text>
            <Text style={styles.timeValue}>{day.closeTime}</Text>
          </TouchableOpacity>
        </View>
      )}

      {!day.isOpen && (
        <View style={styles.closedContainer}>
          <Text style={styles.closedText}>Fermé</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#059669" barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#059669" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#059669" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Horaires d'ouverture</Text>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Sauver</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => {
              setSchedule(prev => prev.map(day => ({
                ...day,
                isOpen: true,
                openTime: '09:00',
                closeTime: '18:00'
              })));
            }}
          >
            <Ionicons name="business-outline" size={20} color="#059669" />
            <Text style={styles.quickActionText}>9h-18h tous les jours</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => {
              setSchedule(prev => prev.map((day, index) => ({
                ...day,
                isOpen: index < 5, // Lun-Ven
                openTime: '08:00',
                closeTime: '17:00'
              })));
            }}
          >
            <Ionicons name="calendar-outline" size={20} color="#059669" />
            <Text style={styles.quickActionText}>8h-17h Lun-Ven</Text>
          </TouchableOpacity>
        </View>

        {/* Schedule */}
        <View style={styles.scheduleContainer}>
          {schedule.map(renderDaySchedule)}
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoIcon}>
            <Ionicons name="information-circle-outline" size={20} color="#059669" />
          </View>
          <Text style={styles.infoText}>
            Utilisez l'icône de copie pour appliquer les horaires d'une journée à toutes les autres.
            Les jours fermés n'apparaîtront pas dans vos horaires publics.
          </Text>
        </View>
      </ScrollView>

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={tempTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  quickActions: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quickActionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  scheduleContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  dayContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  dayActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  copyButton: {
    padding: 5,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  timeButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeSeparator: {
    paddingHorizontal: 15,
  },
  timeSeparatorText: {
    fontSize: 14,
    color: '#666',
  },
  closedContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  closedText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
  },
  infoContainer: {
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#2e7d32',
    lineHeight: 20,
  },
});

export default OpeningHoursScreen;