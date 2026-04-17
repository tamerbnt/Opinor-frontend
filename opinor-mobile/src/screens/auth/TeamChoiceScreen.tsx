import React from 'react';
import { View, StyleSheet, TouchableOpacity, useWindowDimensions, Image, StatusBar } from 'react-native';
import { AppText } from '../../components/ui/AppText';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';

export const TeamChoiceScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const containerWidth = width > 500 ? 390 : width;

  return (
    <View style={[styles.container, { backgroundColor: colors.white }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <View style={[styles.centerWrapper, { width: containerWidth }]}>
        {/* Top Vertical Branding Section */}
        <View style={styles.header}>
          <Image 
            source={require('../../../assets/white vertical 2 (2).png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.content}>
          <AppText variant="h2" weight="bold" colorToken={colors.dark} style={styles.title}>
            {t('team_choice.title')}
          </AppText>
          
          <AppText variant="body" style={styles.subtitle}>
            {t('team_choice.subtitle')}
          </AppText>
        </View>

        <View style={styles.footer}>
          <PrimaryButton 
            label={t('team_choice.book_btn')} 
            onPress={() => navigation.navigate('BookingForm')} 
            style={styles.button}
          />
          
          <TouchableOpacity 
            onPress={() => navigation.navigate('Signup')}
            style={[styles.outlineButton, { borderColor: colors.blue }]}
          >
            <AppText weight="semiBold" colorToken={colors.blue}>{t('team_choice.account_btn')}</AppText>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('Login')}
            style={styles.loginLink}
          >
            <AppText variant="caption">
              {t('team_choice.has_account')} <AppText variant="caption" weight="bold" colorToken={colors.blue}>{t('team_choice.login_link')}</AppText>
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
    paddingTop: 60,
  },
  header: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
    marginTop: 20,
  },
  logo: {
    width: 260,
    height: 210,
  },
  content: {
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
    color: '#6B7280',
    paddingHorizontal: 10,
  },
  footer: {
    paddingBottom: 60,
    marginTop: 40,
  },
  button: {
    marginBottom: 16,
  },
  outlineButton: {
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginLink: {
    alignItems: 'center',
  }
});
