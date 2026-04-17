import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ScribbleLineProps {
  color?: string;
  width?: number;
  height?: number;
}

export const ScribbleLine: React.FC<ScribbleLineProps> = ({ 
  color = '#038788', 
  width = 120, 
  height = 12 
}) => {
  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} viewBox="0 0 120 12" fill="none">
        <Path
          d="M5 8.5C15 7.5 25 10 35 8C45 6 55 10.5 65 8.5C75 6.5 85 10.5 95 9C105 7.5 112 10 118 8.5"
          stroke={color}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />
        <Path
          d="M10 10.5C20 9.5 30 11.5 40 10C50 8.5 60 11.5 70 10C80 8.5 90 11.5 100 10.5C110 9.5 115 11 117 10"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -4, // Overlap slightly with text
  },
});
