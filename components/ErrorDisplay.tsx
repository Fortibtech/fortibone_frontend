
import type { ValidationError } from '@/api/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ErrorDisplayProps {
  errors: ValidationError[];
  onDismiss?: () => void;
  style?: any;
}

interface ErrorMessageProps {
  error: ValidationError;
}

// Composant pour afficher une seule erreur
const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  const getErrorIcon = (code: string) => {
    switch (code) {
      case 'REQUIRED':
        return 'alert-circle-outline';
      case 'INVALID_FORMAT':
        return 'warning-outline';
      case 'MAX_LENGTH':
      case 'MIN_LENGTH':
        return 'text-outline';
      case 'INVALID_VALUE':
        return 'close-circle-outline';
      case 'INSUFFICIENT_PERMISSIONS':
        return 'lock-closed-outline';
      default:
        return 'information-circle-outline';
    }
  };

  const getErrorColor = (code: string) => {
    switch (code) {
      case 'REQUIRED':
        return '#e53e3e';
      case 'INVALID_FORMAT':
        return '#dd6b20';
      case 'MAX_LENGTH':
      case 'MIN_LENGTH':
        return '#d69e2e';
      case 'INVALID_VALUE':
        return '#e53e3e';
      case 'INSUFFICIENT_PERMISSIONS':
        return '#9f7aea';
      default:
        return '#3182ce';
    }
  };

  return (
    <View style={[styles.errorItem, { borderLeftColor: getErrorColor(error.code) }]}>
      <Ionicons 
        name={getErrorIcon(error.code) as any} 
        size={16} 
        color={getErrorColor(error.code)} 
        style={styles.errorIcon}
      />
      <Text style={[styles.errorText, { color: getErrorColor(error.code) }]}>
        {error.message}
      </Text>
    </View>
  );
};

// Composant principal pour afficher les erreurs
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ errors, onDismiss, style }) => {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="warning" size={20} color="#e53e3e" />
          <Text style={styles.headerTitle}>
            {errors.length === 1 ? 'Erreur détectée' : `${errors.length} erreurs détectées`}
          </Text>
        </View>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.errorsList}>
        {errors.map((error, index) => (
          <ErrorMessage key={`${error.field}-${index}`} error={error} />
        ))}
      </View>
    </View>
  );
};

// Composant pour afficher une erreur inline sous un champ
interface InlineErrorProps {
  error?: ValidationError | string;
  style?: any;
}

export const InlineError: React.FC<InlineErrorProps> = ({ error, style }) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorCode = typeof error === 'string' ? 'GENERIC' : error.code;

  return (
    <View style={[styles.inlineError, style]}>
      <Ionicons name="alert-circle-outline" size={14} color="#e53e3e" />
      <Text style={styles.inlineErrorText}>{errorMessage}</Text>
    </View>
  );
};

// Composant pour afficher un message de succès
interface SuccessMessageProps {
  message: string;
  onDismiss?: () => void;
  style?: any;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ message, onDismiss, style }) => {
  return (
    <View style={[styles.successContainer, style]}>
      <View style={styles.successContent}>
        <Ionicons name="checkmark-circle" size={20} color="#38a169" />
        <Text style={styles.successText}>{message}</Text>
      </View>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
          <Ionicons name="close" size={20} color="#38a169" />
        </TouchableOpacity>
      )}
    </View>
  );
};

// Hook pour gérer les erreurs de validation
export const useValidationErrors = () => {
  const [errors, setErrors] = React.useState<ValidationError[]>([]);

  const addError = (error: ValidationError) => {
    setErrors(prev => [...prev, error]);
  };

  const addErrors = (newErrors: ValidationError[]) => {
    setErrors(prev => [...prev, ...newErrors]);
  };

  const removeError = (field: string) => {
    setErrors(prev => prev.filter(error => error.field !== field));
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const hasErrors = errors.length > 0;
  const hasErrorForField = (field: string) => errors.some(error => error.field === field);
  const getErrorForField = (field: string) => errors.find(error => error.field === field);

  return {
    errors,
    addError,
    addErrors,
    removeError,
    clearErrors,
    hasErrors,
    hasErrorForField,
    getErrorForField
  };
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#fecaca',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991b1b',
    marginLeft: 8,
  },
  dismissButton: {
    padding: 4,
  },
  errorsList: {
    padding: 8,
  },
  errorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderLeftWidth: 3,
    backgroundColor: 'white',
    borderRadius: 4,
    marginVertical: 2,
  },
  errorIcon: {
    marginRight: 8,
    marginTop: 1,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
  },
  inlineError: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  inlineErrorText: {
    fontSize: 12,
    color: '#e53e3e',
    marginLeft: 4,
    flex: 1,
  },
  successContainer: {
    backgroundColor: '#f0fff4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9ae6b4',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  successContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  successText: {
    fontSize: 14,
    color: '#276749',
    marginLeft: 8,
    flex: 1,
  },
});

export default ErrorDisplay;