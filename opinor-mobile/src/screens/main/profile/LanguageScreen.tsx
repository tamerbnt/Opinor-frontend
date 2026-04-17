import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { RadioButton } from '../../../components/ui/RadioButton';

export const LanguageScreen = () => {
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();

  const currentLanguage = i18n.language;

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    // Note: Per user request, we are NOT forcing RTL layout flip for Arabic.
    // Text strings will update but layout stays LTR.
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.dark : '#F8FAFC' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[
          styles.listCard, 
          { backgroundColor: isDark ? '#2A2D31' : '#FFFFFF' }
        ]}>
          <RadioButton 
            label={t('language.english')} 
            selected={currentLanguage === 'en'} 
            onPress={() => handleLanguageChange('en')} 
          />
          <View style={[styles.separator, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]} />
          
          <RadioButton 
            label={t('language.french')} 
            selected={currentLanguage === 'fr'} 
            onPress={() => handleLanguageChange('fr')} 
          />
          <View style={[styles.separator, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]} />

          <RadioButton 
            label={t('language.arabic')} 
            selected={currentLanguage === 'ar'} 
            onPress={() => handleLanguageChange('ar')} 
          />
        </View>

        <Text style={styles.infoText}>
          The application layout will remain LTR for all languages to ensure structural consistency.
        </Text>
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
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  }
});
