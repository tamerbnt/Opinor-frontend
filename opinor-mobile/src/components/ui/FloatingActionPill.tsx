import React from 'react';
import { TouchableOpacity, StyleSheet, TouchableOpacityProps } from 'react-native';
import { AppText } from './AppText';
import { useTheme } from '../../theme/ThemeContext';

export interface FloatingActionPillProps extends TouchableOpacityProps {
  label: string;
  icon?: React.ReactNode; 
  active?: boolean;
}

export const FloatingActionPill: React.FC<FloatingActionPillProps> = ({
  label,
  icon,
  active,
  style,
  ...rest
}) => {
  const { isDark, colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.pill,
        {
          backgroundColor: active 
            ? colors.blue 
            : (isDark ? colors.darkishCard : colors.grisLight),
          // Light mode shadow only for inactive state to match Figma depth
          shadowColor: isDark || active ? 'transparent' : '#000',
          shadowOffset: (isDark || active) ? { width: 0, height: 0 } : { width: 0, height: 4 },
          shadowOpacity: (isDark || active) ? 0 : 0.08,
          shadowRadius: (isDark || active) ? 0 : 12,
          elevation: (isDark || active) ? 0 : 4,
        },
        style,
      ]}
      {...rest}
    >
      {icon}
      <AppText 
        weight="semiBold" 
        colorToken={active ? colors.white : colors.blue} 
        style={icon ? { marginLeft: 8 } : {}}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999, // Perfect pill
  },
});
