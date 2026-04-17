import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { RadioButton } from '../../../components/ui/RadioButton';
import { AppText } from '../../../components/ui/AppText';

export const AppearanceScreen = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.dark : '#F8FAFC' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[
          styles.listCard, 
          { backgroundColor: isDark ? '#2A2D31' : '#FFFFFF' }
        ]}>
          <RadioButton 
            label={t('appearance.light')} 
            selected={!isDark} 
            onPress={() => isDark && toggleTheme()} 
          />
          <View style={[styles.separator, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]} />
          
          <RadioButton 
            label={t('appearance.dark')} 
            selected={isDark} 
            onPress={() => !isDark && toggleTheme()} 
          />
        </View>

        <AppText variant="caption" style={styles.infoText}>
          Select your preferred application theme.
        </AppText>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  listCard: {
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  separator: {
    height: 1,
    width: '100%',
  },
  infoText: {
    marginTop: 24,
    textAlign: 'center',
  }
});
