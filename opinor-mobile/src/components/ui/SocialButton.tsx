import React from 'react';
import { TouchableOpacity, StyleSheet, View, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { useTheme } from '../../theme/ThemeContext';
import { GoogleIcon } from './Icons';

interface SocialButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
}

export const SocialButton: React.FC<SocialButtonProps> = ({ label, onPress, style }) => {
  const { colors, isDark } = useTheme();

  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: isDark ? '#2A2D31' : '#FFFFFF',
          borderColor: isDark ? '#374151' : '#E5E7EB',
        },
        style
      ]}
    >
      <View style={styles.iconContainer}>
        <GoogleIcon size={24} />
      </View>
      <AppText weight="semiBold" colorToken={colors.dark} style={styles.label}>
        {label}
      </AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconContainer: {
    position: 'absolute',
    left: 24,
  },
  label: {
    fontSize: 16,
  }
});
