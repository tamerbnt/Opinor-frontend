import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';

const { width } = Dimensions.get('window');

export const NotificationEmptyState = () => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={[
        styles.card, 
        { 
          // Flat soft grey for light mode, flat dark for dark mode
          backgroundColor: isDark ? '#2A2D31' : '#F9FAFB',
        }
      ]}>
        <Image 
          // Use the correct Light image for light mode, fallback to original for dark mode
          source={
            isDark 
              ? require('../../../assets/illustration_notifications.png') 
              : require('../../../assets/illustration_notifications_light.png')
          }
          style={styles.illustration}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: colors.dark }]}>
          {t('notifications_screen.empty.title') || 'No Notification Available At This Time'}
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#9CA3AF' : '#9CA3AF' }]}>
          {t('notifications_screen.empty.subtitle') || 'We strive to keep you informed, and when there are updates or important messages for you, we\'ll make sure to notify you promptly. Thank you for using our app, and stay tuned for future notifications!'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 64, // Shifted to precisely match the reference top gap
  },
  card: {
    width: '100%',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24, // softer radius from reference design
    // No massive shadows, kept completely flat and modern
  },
  illustration: {
    width: 140,
    height: 140,
    marginBottom: 24,
  },
  title: {
    fontSize: 20, // bumped up to match reference
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 0,
  },
});
