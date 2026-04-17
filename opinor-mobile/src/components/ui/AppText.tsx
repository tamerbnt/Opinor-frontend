import React from 'react';
import { Text, TextProps, StyleSheet, Platform, TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface AppTextProps extends TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'muted' | 'buttonText';
  weight?: 'regular' | 'semiBold' | 'bold';
  colorToken?: string;
  // Note: 'style' is intentionally NOT re-declared here.
  // It inherits StyleProp<TextStyle> from TextProps, which correctly
  // accepts TextStyle, TextStyle[], arrays, etc.
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
    color: colorToken || colors.text,
    fontWeight: getFontWeight() as any,
  };

  const variants = StyleSheet.create({
    h1: { fontSize: 32, lineHeight: 40, letterSpacing: -0.5 },
    h2: { fontSize: 24, lineHeight: 32, letterSpacing: -0.3 },
    h3: { fontSize: 20, lineHeight: 28, letterSpacing: -0.2 },
    body: { fontSize: 16, lineHeight: 24 },
    caption: { fontSize: 13, lineHeight: 18, color: colors.textSecondary },
    muted: { fontSize: 15, color: colors.textSecondary },
    buttonText: { fontSize: 16, lineHeight: 24, fontWeight: '700' },
  });

  return (
    <Text style={[baseStyle, variants[variant], style]} {...rest}>
      {children}
    </Text>
  );
};
