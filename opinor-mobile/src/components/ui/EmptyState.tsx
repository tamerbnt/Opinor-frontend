import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { PrimaryButton } from './PrimaryButton';
import { useTheme } from '../../theme/ThemeContext';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  // This will later be a specific SVG component prop if we want it dynamically changeable
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const { isDark, colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.illustrationPlaceholder}>
        <AppText variant="muted">Wait for SVG Illustration</AppText>
      </View>
      
      <AppText variant="h2" style={styles.title}>
        {title}
      </AppText>
      
      <AppText variant="body" colorToken={isDark ? '#9CA3AF' : '#6B7280'} style={styles.description}>
        {description}
      </AppText>

      {actionLabel && onAction && (
        <View style={styles.actionContainer}>
          <PrimaryButton 
            label={actionLabel} 
            onPress={onAction} 
            // Inversion matches the Figma: Teal button light mode, Mint button dark mode
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  illustrationPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#0F827710', // Soft pastel fallback
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  actionContainer: {
    width: '100%',
  }
});
