import React from 'react';
import { Text, TextProps, StyleSheet, TextStyle, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface AppTextProps extends TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'body' | 'caption' | 'muted';
  weight?: 'regular' | 'semiBold' | 'bold';
  colorToken?: string;
  style?: TextStyle | TextStyle[];
}

export const AppText: React.FC<AppTextProps> = ({ 
  children, 
  variant = 'body', 
  weight = 'regular', 
  colorToken,
  style,
  ...rest
}) => {
  const { colors, isDark } = useTheme();

  const getFontWeight = () => {
    switch (weight) {
      case 'bold': return '700';
      case 'semiBold': return '600';
      default: return '400';
    }
  };

  const baseStyle: TextStyle = {
    // Forcing 'Inter' with fallback to sans-serif for Web Fidelity
    fontFamily: Platform.select({
      web: 'Inter, system-ui, -apple-system, sans-serif',
      default: weight === 'bold' ? 'Inter_700Bold' : weight === 'semiBold' ? 'Inter_600SemiBold' : 'Inter_400Regular'
    }),
    color: colorToken || (isDark ? colors.white : colors.dark),
    fontWeight: getFontWeight() as any,
  };

  const variants = StyleSheet.create({
    h1: { fontSize: 32, lineHeight: 40, letterSpacing: -0.5 },
    h2: { fontSize: 24, lineHeight: 32, letterSpacing: -0.3 },
    body: { fontSize: 16, lineHeight: 24 },
    caption: { fontSize: 13, lineHeight: 18 },
    muted: { fontSize: 15, color: isDark ? '#9CA3AF' : '#6B7280' },
  });

  return (
    <Text style={[baseStyle, variants[variant], style]} {...rest}>
      {children}
    </Text>
  );
};
