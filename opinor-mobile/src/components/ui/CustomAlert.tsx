import React from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  Pressable
} from 'react-native';
import { AppText } from './AppText';
import { useTheme } from '../../theme/ThemeContext';
import { useAlertStore } from '../../store/AlertStore';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const CustomAlert = () => {
  const { colors, isDark } = useTheme();
  const { isVisible, config, hideAlert } = useAlertStore();

  if (!config) return null;

  const { title, message, type = 'info', buttons } = config;

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle size={48} color={colors.green} />;
      case 'error': return <AlertCircle size={48} color={colors.brique} />;
      case 'warning': return <AlertTriangle size={48} color="#F59E0B" />;
      default: return <Info size={48} color={colors.blue} />;
    }
  };

  const renderButtons = () => {
    if (!buttons || buttons.length === 0) {
      return (
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.blue }]} 
          onPress={hideAlert}
        >
          <AppText colorToken="#FFFFFF" weight="bold">OK</AppText>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.buttonContainer}>
        {buttons.map((btn, index) => (
          <TouchableOpacity 
            key={index}
            style={[
              styles.button, 
              { 
                backgroundColor: btn.style === 'cancel' ? (isDark ? '#374151' : '#F3F4F6') : 
                                btn.style === 'destructive' ? colors.brique : colors.blue ,
                flex: buttons.length > 1 ? 1 : 0,
                marginLeft: index > 0 ? 12 : 0
              }
            ]} 
            onPress={() => {
              hideAlert();
              if (btn.onPress) btn.onPress();
            }}
          >
            <AppText 
              colorToken={btn.style === 'cancel' ? (isDark ? '#D1D5DB' : '#4B5563') : '#FFFFFF'} 
              weight="bold"
            >
              {btn.text}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={hideAlert}
    >
      <Pressable style={styles.overlay} onPress={hideAlert}>
        <Pressable style={[styles.card, { backgroundColor: isDark ? colors.sombreCards : colors.white }]}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeIcon} onPress={hideAlert}>
            <X size={20} color={isDark ? '#6B7280' : '#9CA3AF'} />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            {getIcon()}
          </View>

          <AppText variant="h2" weight="bold" style={styles.title}>
            {title}
          </AppText>

          <AppText variant="body" style={styles.message}>
            {message}
          </AppText>

          {renderButtons()}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  closeIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  iconContainer: {
    marginBottom: 20,
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    color: '#6B7280',
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  button: {
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    minWidth: 120,
  }
});
