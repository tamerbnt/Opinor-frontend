import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export const ProcessingDots = () => {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      {[0, 1, 2, 3].map((i) => (
        <View 
          key={i} 
          style={[
            styles.dot,
            {
              backgroundColor: i === 2 ? '#038788' : (isDark ? '#374151' : '#E5E7EB'),
            }
          ]} 
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  }
});
