import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ErrorModalProps {
  visible: boolean;
  onClose: () => void;
  onRetry?: () => void;
  type: "depot" | "retrait";
  errorMessage: string;
  showRetryButton?: boolean;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  onClose,
  onRetry,
  type,
  errorMessage,
  showRetryButton = true,
}) => {
  const scaleValue = React.useRef(new Animated.Value(0)).current;
  const shakeValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(shakeValue, {
            toValue: 10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeValue, {
            toValue: -10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeValue, {
            toValue: 10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeValue, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      scaleValue.setValue(0);
      shakeValue.setValue(0);
    }
  }, [visible]);

  const getTitle = () => {
    return type === "depot" ? "Dépôt Échoué" : "Retrait Échoué";
  };

  const handleRetry = () => {
    onClose();
    if (onRetry) {
      setTimeout(() => {
        onRetry();
      }, 300);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ scale: scaleValue }, { translateX: shakeValue }],
              },
            ]}
          >
            {/* Error Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="close" size={48} color="#FFFFFF" />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>{getTitle()}</Text>

            {/* Error Message from API */}
            <View style={styles.errorMessageContainer}>
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
              {showRetryButton && onRetry && (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={handleRetry}
                >
                  <Ionicons name="refresh" size={18} color="#EF4444" />
                  <Text style={styles.retryButtonText}>Réessayer</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.closeButton,
                  !showRetryButton && styles.closeButtonFull,
                ]}
                onPress={onClose}
              >
                <Text style={styles.closeButtonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#EF4444",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
    textAlign: "center",
  },
  errorMessageContainer: {
    backgroundColor: "#FEF2F2",
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    width: "100%",
  },
  errorMessage: {
    fontSize: 15,
    color: "#991B1B",
    textAlign: "left",
    lineHeight: 22,
  },
  buttonsContainer: {
    width: "100%",
    gap: 12,
  },
  retryButton: {
    backgroundColor: "#FEF2F2",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EF4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  retryButtonText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  closeButtonFull: {
    backgroundColor: "#EF4444",
  },
  closeButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default ErrorModal;
