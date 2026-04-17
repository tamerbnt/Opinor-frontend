import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, useWindowDimensions } from 'react-native';
import { AppText } from '../../components/ui/AppText';
import { CustomInput } from '../../components/ui/CustomInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { SocialButton } from '../../components/ui/SocialButton';
import { ArrowLeft } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { getStartupData } from '../../api/dashboard';

import { login as apiLogin } from '../../api/auth';
import { useAlertStore } from '../../store/AlertStore';

export const LoginScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const signIn = useAuthStore(state => state.signIn);
  const showAlert = useAlertStore(state => state.showAlert);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();

  // Constrain width for web fidelity
  const containerWidth = width > 500 ? 390 : width;

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert({
        title: t('common.error'),
        message: t('auth.login.empty_fields'),
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // 1. Perform Real Login
      const response = await apiLogin({ email, password });
      
      // 2. High-speed parallel prefetch during the transition
      // We don't await this to keep the "Instant Feel" unless you want 100% data ready
      queryClient.prefetchQuery({
        queryKey: ['dashboardStartup'],
        queryFn: getStartupData,
        staleTime: 1000 * 60 * 5,
      }).catch(err => console.log('Prefetch warning:', err));
      
      // 3. Commit session to Store & SecureStore
      await signIn(response.token, response.user);
      
    } catch (e: any) {
      console.log('Login failed', e);
      const errorMsg = e.response?.data?.message || t('auth.login.error_generic');
      showAlert({
        title: t('common.error'),
        message: errorMsg,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: isDark ? colors.dark : colors.white }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.formContainer, { width: containerWidth }]}>
        {/* Navigation Header */}
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft color={isDark ? colors.white : colors.dark} size={24} />
          </TouchableOpacity>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.header}>
          <AppText variant="h1" weight="bold" style={styles.title}>{t('auth.login.title')}</AppText>
        </View>

        {/* Dynamic Themed Inputs */}
        <CustomInput
          label={t('auth.login.email')}
          placeholder={t('auth.login.email_placeholder')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <CustomInput
          label={t('auth.login.password')}
          placeholder={t('auth.login.password_placeholder')}
          value={password}
          onChangeText={setPassword}
          isPassword
        />

        {/* Security Routing */}
        <TouchableOpacity 
          style={styles.forgotPassword} 
          onPress={() => navigation.navigate('ForgotPassword')}
          activeOpacity={0.7}
        >
          <AppText variant="body" colorToken={colors.blue} weight="semiBold">
            {t('auth.login.forgot_password')}
          </AppText>
        </TouchableOpacity>

        <PrimaryButton 
          label={t('auth.login.submit')} 
          onPress={handleLogin} 
          loading={isLoading} 
          style={styles.submitBtn} 
        />

        <View style={styles.dividerContainer}>
          <View style={[styles.dividerLine, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />
          <AppText variant="caption" style={styles.dividerText}>{t('auth.login.or_continue')}</AppText>
          <View style={[styles.dividerLine, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />
        </View>

        <SocialButton 
          label={t('auth.login.google_login')} 
          onPress={() => console.log('Google Login')} 
          style={styles.socialBtn}
        />

        {/* Conversion Logic */}
        <View style={styles.signupContainer}>
          <AppText variant="muted">{t('auth.login.no_account')}</AppText>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')} activeOpacity={0.7} style={{ marginLeft: 6 }}>
            <AppText variant="body" colorToken={colors.blue} weight="bold">
              {t('auth.login.signup_link')}
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Quick Review Bypass (Testing Only) */}
        {__DEV__ && (
          <TouchableOpacity 
            style={styles.bypassBtn} 
            onPress={async () => {
              const mockUser = {
                id: 'mock-123',
                firstName: 'Opinor',
                lastName: 'Tester',
                email: 'test@opinor.com',
                businessName: 'From Scratch',
                role: 'business_owner',
                isActive: true
              };
              await signIn('mock-token', mockUser);
            }}
          >
            <AppText variant="caption" style={{ color: colors.blue }}>
              ⚡ Quick Review Bypass (Testing Only)
            </AppText>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    flex: 1,
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
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  submitBtn: {
    marginBottom: 30,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6B7280',
  },
  socialBtn: {
    marginBottom: 40,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  bypassBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  }
});
