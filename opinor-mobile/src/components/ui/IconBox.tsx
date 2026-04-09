import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export interface IconBoxProps {
  children: React.ReactNode;
  variant?: 'green' | 'red' | 'blue' | 'purple';
  size?: number;
  style?: ViewStyle;
}

export const IconBox: React.FC<IconBoxProps> = ({ 
  children, 
  variant = 'green',
  size = 48,
  style
}) => {
  const { colors } = useTheme();

  const getBackgroundColor = () => {
    switch(variant) {
      case 'red': return colors.pRed;
      case 'blue': return colors.pBlue;
      case 'purple': return colors.pPurple;
      case 'green':
      default: return colors.pGreen;
    }
  };

  return (
    <View style={[
      styles.container,
      {
        width: size,
        height: size,
        borderRadius: size / 2, // Perfect circle mathematical guarantee
        backgroundColor: getBackgroundColor()
      },
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  }
});
