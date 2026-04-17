import React from 'react';
import { View, StyleSheet, useWindowDimensions, Image, StatusBar, TouchableOpacity } from 'react-native';
import { AppText } from '../../components/ui/AppText';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';

export const BookingSuccessScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const containerWidth = width > 500 ? 390 : width;

  return (
    <View style={[styles.container, { backgroundColor: colors.white }]}>
      <StatusBar barStyle="dark-content" />
      
      <View style={[styles.centerWrapper, { width: containerWidth }]}>
        <View style={styles.header}>
          <Image 
            source={require('../../../assets/white vertical 2 (2).png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </View>

        <View style={styles.content}>
          <AppText variant="h2" weight="bold" colorToken={colors.dark} style={styles.title}>
            {t('booking.success.title')}
          </AppText>
          
          <AppText variant="body" style={styles.subtitle}>
            {t('booking.success.subtitle')}
          </AppText>
        </View>

        <View style={styles.footer}>
          <PrimaryButton 
            label={t('booking.success.back_btn')} 
            onPress={() => navigation.navigate('TeamChoice')} 
            style={styles.button}
          />

          <TouchableOpacity 
            onPress={() => navigation.navigate('Login')}
            style={styles.loginLink}
          >
            <AppText variant="caption">
              {t('booking.form.has_account')} <AppText variant="caption" weight="bold" colorToken={colors.blue}>{t('booking.form.login_link')}</AppText>
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  centerWrapper: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 300,
    height: 240,
  },
  content: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 32,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
    color: '#6B7280',
  },
  footer: {
    width: '100%',
  },
  button: {
    marginBottom: 24,
  },
  loginLink: {
    alignItems: 'center',
  }
});
