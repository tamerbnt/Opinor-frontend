import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native';
import { AppText } from '../../components/ui/AppText';
import { CustomInput } from '../../components/ui/CustomInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react-native';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const containerWidth = width > 500 ? 390 : width;
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSent(true);
    }, 1500);
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: isDark ? colors.dark : colors.white }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ width: containerWidth, flex: 1 }}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Navigation Header */}
          <View style={styles.navHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft color={colors.dark} size={24} />
            </TouchableOpacity>
            <AppText weight="semiBold" style={styles.navTitle}>{t('auth.forgot_password.nav_title')}</AppText>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.header}>
            <AppText variant="h1" weight="bold" style={styles.title}>{t('auth.forgot_password.title')}</AppText>
            
            {sent ? (
              <View style={styles.successBox}>
                <AppText variant="body" style={styles.subtitle}>
                  {t('auth.forgot_password.sent_msg')}
                </AppText>
                <PrimaryButton 
                  label={t('auth.forgot_password.return_login')} 
                  onPress={() => navigation.navigate('Login')} 
                  style={styles.submitBtn} 
                />
              </View>
            ) : (
              <>
                <AppText variant="body" style={styles.subtitle}>
                  {t('auth.forgot_password.instr')}
                </AppText>

                <CustomInput
                  label={t('auth.forgot_password.email_label')}
                  placeholder={t('auth.forgot_password.email_placeholder')}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <PrimaryButton 
                  label={t('auth.forgot_password.send_btn')} 
                  onPress={handleReset} 
                  loading={isLoading} 
                  style={styles.submitBtn} 
                />
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  navTitle: {
    fontSize: 16,
  },
  header: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    lineHeight: 24,
    color: '#6B7280',
  },
  submitBtn: {
    marginTop: 20,
    marginBottom: 40,
  },
  successBox: {
    marginTop: 20,
  }
});
