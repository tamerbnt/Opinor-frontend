import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';

interface SkeletonProps {
  width: number | string;
  height: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width, 
  height, 
  borderRadius = 12, 
  style 
}) => {
  const { isDark, colors } = useTheme();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { 
        duration: 1200, 
        easing: Easing.inOut(Easing.ease) 
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Design-specific colors for skeletons to match surface cards
  const backgroundColor = isDark 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(0, 0, 0, 0.05)';

  return (
    <Animated.View 
      style={[
        styles.base,
        { 
          width: width as DimensionValue, 
          height: height as DimensionValue, 
          borderRadius, 
          backgroundColor 
        },
        animatedStyle,
        style
      ]} 
    />
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
