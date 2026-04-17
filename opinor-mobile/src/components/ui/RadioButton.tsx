import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { AppText } from './AppText';

interface RadioButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export const RadioButton: React.FC<RadioButtonProps> = ({ label, selected, onPress }) => {
  const { colors, isDark } = useTheme();
  
  // Teal color from theme or hardcoded for brand consistency
  const brandTeal = '#038788';

  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={onPress} 
      style={styles.container}
    >
      <AppText weight="semiBold" style={styles.label}>{label}</AppText>
      <View style={[
        styles.outerCircle, 
        { borderColor: selected ? brandTeal : '#9CA3AF' }
      ]}>
        {selected && (
          <View style={[styles.innerCircle, { backgroundColor: brandTeal }]} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  outerCircle: {
    height: 22,
    width: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    height: 12,
    width: 12,
    borderRadius: 6,
  },
});
