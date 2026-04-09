import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Radii } from '../../constants/Theme';

export interface SurfaceCardProps extends ViewProps {
  flexRow?: boolean;
  variant?: 'standard' | 'feedbackList' | 'nestedInner';
}

export const SurfaceCard: React.FC<SurfaceCardProps> = ({ 
  children, 
  style,
  flexRow,
  variant = 'standard',
  ...rest 
}) => {
  const { isDark, colors } = useTheme();

  return (
    <View 
      style={[
        styles.base,
        {
          // Figma math applied dynamically based on discovered variations
          backgroundColor: variant === 'nestedInner' && isDark ? '#363D42' : isDark ? colors.sombreCards : colors.white,
          borderRadius: variant === 'feedbackList' ? 10 : Radii.card, // Feedback list uses 10px, maps strictly to standard 11px otherwise
          padding: variant === 'feedbackList' ? 30 : 15, // Feedback list visually requires massive 30px padding (29.03px parsed)
          flexDirection: flexRow ? 'row' : 'column',
          
          // Shadows stripped out safely for flat dark mode
          shadowColor: isDark ? 'transparent' : '#000',
          shadowOffset: isDark ? { width: 0, height: 0 } : { width: 0, height: 2 },
          shadowOpacity: isDark ? 0 : 0.05,
          shadowRadius: isDark ? 0 : 8,
          elevation: isDark ? 0 : 2,
        },
        style,
      ]} 
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    width: '100%',
  }
});
