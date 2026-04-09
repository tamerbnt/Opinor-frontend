import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, TouchableOpacityProps, View } from 'react-native';
import { AppText } from './AppText';
import { useTheme } from '../../theme/ThemeContext';
import { Radii } from '../../constants/Theme';

export interface PrimaryButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'danger' | 'ghost';
  loading?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  variant = 'primary',
  loading = false,
  style,
  disabled,
  ...rest
}) => {
  const { colors, isDark } = useTheme();

  // Button Color inversion explicitly defined from empty state Figma reviews
  const getBackgroundColor = () => {
    if (variant === 'danger') return colors.brique;
    if (variant === 'ghost') return 'transparent';
    return colors.blue; // Brand teal #038788 in both light and dark mode
  };

  const getTextColor = () => {
    if (variant === 'danger') return colors.white;
    if (variant === 'ghost') return isDark ? colors.white : colors.blue;
    // For Primary button:
    if (isDark) {
      // Mint green background -> Dark text reads best, or white.
      // Based on design, primary buttons universally use white text, or brand dark.
      // Let's stick to absolute white unless otherwise required.
      return '#FFFFFF';
    } else {
      return '#FFFFFF';
    }
  };

  const bg = getBackgroundColor();
  const txCol = getTextColor();

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: bg,
          borderRadius: Radii.button, // Hard-locked to exactly 20px
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={txCol} />
      ) : (
        <AppText 
          weight="semiBold" 
          colorToken={txCol} 
          style={{ fontSize: 16 }}
        >
          {label}
        </AppText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 50, // Extracted mathematical parameter
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
