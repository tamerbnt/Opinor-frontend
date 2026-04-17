import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppText } from '../../../components/ui/AppText';
import { Mail, MessageCircle, ExternalLink } from 'lucide-react-native';

export const SupportScreen = () => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const handleEmail = () => {
    Linking.openURL('mailto:support@opinor.app');
  };

  const OptionCard = ({ icon: Icon, title, description, onPress }: any) => (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={onPress}
      style={[styles.card, { backgroundColor: isDark ? '#2A2D31' : '#FFFFFF' }]}
    >
      <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(3, 135, 136, 0.1)' : '#F0F9F9' }]}>
        <Icon color="#038788" size={24} />
      </View>
      <View style={styles.textContent}>
        <AppText weight="bold" style={{ fontSize: 16, marginBottom: 4 }}>{title}</AppText>
        <AppText variant="muted">{description}</AppText>
      </View>
      <ExternalLink color="#9CA3AF" size={18} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.dark : colors.pageBg }]}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}>
        
        <View style={styles.header}>
          <AppText variant="h2" weight="bold" style={{ marginBottom: 8 }}>{t('support.title')}</AppText>
          <AppText variant="muted">{t('support.description')}</AppText>
        </View>

        <OptionCard 
          icon={MessageCircle}
          title={t('support.faq.title')}
          description={t('support.faq.description')}
          onPress={() => Linking.openURL('https://opinor.app/faq')}
        />

        <OptionCard 
          icon={Mail}
          title={t('support.email.title')}
          description={t('support.email.description')}
          onPress={handleEmail}
        />

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 32 },
  header: { marginBottom: 32 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContent: { flex: 1, paddingRight: 16 },
});
