import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppText } from '../../../components/ui/AppText';
import { FileText, Shield, ChevronRight } from 'lucide-react-native';

export const LegalScreen = () => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const DocumentItem = ({ icon: Icon, title, url }: any) => (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={() => Linking.openURL(url)}
      style={[styles.item, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }]}
    >
      <View style={styles.itemLeft}>
        <Icon color="#038788" size={20} style={{ marginRight: 16 }} />
        <AppText weight="semiBold" style={{ fontSize: 16 }}>{title}</AppText>
      </View>
      <ChevronRight color="#9CA3AF" size={20} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.dark : colors.pageBg }]}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}>
        
        <View style={[styles.card, { backgroundColor: isDark ? '#2A2D31' : '#FFFFFF' }]}>
          <DocumentItem 
            icon={FileText} 
            title={t('legal.terms')} 
            url="https://opinor.app/terms" 
          />
          <DocumentItem 
            icon={Shield} 
            title={t('legal.privacy')} 
            url="https://opinor.app/privacy" 
          />
          <DocumentItem 
            icon={FileText} 
            title={t('legal.dpa')} 
            url="https://opinor.app/dpa" 
          />
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 32 },
  card: {
    borderRadius: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
