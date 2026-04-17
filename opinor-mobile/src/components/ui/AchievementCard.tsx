import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { useTheme } from '../../theme/ThemeContext';
import { Radii } from '../../constants/Theme';
import * as LucideIcons from 'lucide-react-native';

interface AchievementCardProps {
  type: 'positive' | 'negative';
  value: string | number;
  label: string;
  style?: ViewStyle;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  type,
  value,
  label,
  style,
}) => {
  const { colors, isDark } = useTheme();

  const isPositive = type === 'positive';
  const mainColor = isPositive ? colors.green : colors.brique;
  
  // Design-specific backgrounds: Pastel in light, Ghost/Charcoal in dark
  const backgroundColor = isDark 
    ? '#2A2D31'  // Matches dashboard cards for a "ghost" integrated look
    : (isPositive ? colors.pGreen : colors.pRed);

  const Icon = isPositive ? LucideIcons.ThumbsUp : LucideIcons.ThumbsDown;

  return (
    <View style={[styles.card, { backgroundColor, borderWidth: isDark ? 1 : 0, borderColor: 'rgba(255,255,255,0.05)' }, style]}>
      <View style={[
        styles.iconContainer, 
        { backgroundColor: isDark ? (isPositive ? 'rgba(46, 204, 113, 0.1)' : 'rgba(217, 83, 79, 0.1)') : 'rgba(255,255,255,0.4)' }
      ]}>
        <Icon size={18} color={mainColor} strokeWidth={2.5} />
      </View>
      
      <View style={styles.content}>
        <AppText weight="bold" style={[styles.value, { color: isDark ? colors.white : colors.text }]}>
          {value}
        </AppText>
        <AppText 
          variant="caption" 
          colorToken={isDark ? colors.textSecondary : '#6B7280'} 
          style={styles.label}
        >
          {label}
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 156,
    height: 104,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    marginTop: 8,
  },
  value: {
    fontSize: 22,
    lineHeight: 28,
  },
  label: {
    fontSize: 10,
    marginTop: 2,
  },
});
