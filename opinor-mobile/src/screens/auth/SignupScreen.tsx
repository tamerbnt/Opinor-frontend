import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { AppText } from '../../components/ui/AppText';
import { CustomInput } from '../../components/ui/CustomInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { SocialButton } from '../../components/ui/SocialButton';
import { OTPInput } from '../../components/ui/OTPInput';
import { ProcessingDots } from '../../components/ui/ProcessingDots';
import { ArrowLeft } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { Dropdown } from '../../components/ui/Dropdown';

export const SignupScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const containerWidth = width > 500 ? 390 : width;
  const signIn = useAuthStore(state => state.signIn);
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [branchCount, setBranchCount] = useState('1');

  const industryOptions = [
    { label: t('auth.signup.industries.RESTAURANT'), value: 'RESTAURANT' },
    { label: t('auth.signup.industries.BEACH'), value: 'BEACH' },
    { label: t('auth.signup.industries.CLINIC'), value: 'CLINIC' },
    { label: t('auth.signup.industries.CAFE'), value: 'CAFE' },
    { label: t('auth.signup.industries.HOTEL'), value: 'HOTEL' },
    { label: t('auth.signup.industries.RETAIL'), value: 'RETAIL' },
    { label: t('auth.signup.industries.OTHER'), value: 'OTHER' },
  ];

  const branchCountOptions = [
    { label: t('auth.signup.branch_counts.1'), value: '1' },
    { label: t('auth.signup.branch_counts.2_5'), value: '2_5' },
    { label: t('auth.signup.branch_counts.5_10'), value: '5_10' },
    { label: t('auth.signup.branch_counts.10_plus'), value: '10_plus' },
  ];

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => Math.max(1, prev - 1));

  const handleFinalSignup = async () => {
    setIsLoading(true);
    // Developer Bypass: Simultaneously mock processing and perform sign-in
    setTimeout(async () => {
      setIsLoading(false);
      nextStep(); // Move to OTP
    }, 1500);
  };

  const renderNavHeader = (title: string) => (
    <View style={styles.navHeader}>
      <TouchableOpacity onPress={prevStep}>
        <ArrowLeft color={colors.dark} size={24} />
      </TouchableOpacity>
      <AppText weight="semiBold" style={styles.navTitle}>{title}</AppText>
      <View style={{ width: 24 }} />
    </View>
  );

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.headerLarge}>
              <AppText variant="h1" weight="bold" style={styles.titleLarge}>{t('auth.signup.step1_title')}</AppText>
            </View>

            <CustomInput
              label={t('auth.login.email')}
              placeholder={t('auth.signup.email_placeholder')}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <PrimaryButton 
              label={t('auth.signup.email_continue')} 
              onPress={nextStep} 
              style={styles.submitBtn} 
            />

            <View style={styles.dividerContainer}>
              <View style={[styles.dividerLine, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />
              <AppText variant="caption" style={styles.dividerText}>{t('auth.login.or_continue')}</AppText>
              <View style={[styles.dividerLine, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />
            </View>

            <SocialButton 
              label={t('auth.signup.google_continue')} 
              onPress={() => console.log('Google Auth')} 
              style={styles.socialBtn}
            />

            <View style={styles.loginContainer}>
              <AppText variant="muted">{t('auth.signup.has_account')}</AppText>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <AppText colorToken={colors.blue} weight="bold">{t('auth.signup.login_link')}</AppText>
              </TouchableOpacity>
            </View>
          </View>
        );
      
      case 2:
        return (
          <View style={styles.stepContainer}>
            {renderNavHeader(t('auth.signup.step2_nav'))}
            <View style={styles.headerProcess}>
              <AppText variant="h2" weight="bold" style={styles.stepTitle}>{t('auth.signup.step2_title')}</AppText>
            </View>

            <CustomInput label={t('auth.signup.name_label')} placeholder={t('auth.signup.name_placeholder')} value={name} onChangeText={setName} />
            <CustomInput label={t('auth.signup.phone_label')} placeholder={t('auth.signup.phone_placeholder')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <CustomInput label={t('auth.signup.password_label')} placeholder={t('auth.signup.password_placeholder')} value={password} onChangeText={setPassword} isPassword />
            <CustomInput label={t('auth.signup.confirm_label')} placeholder={t('auth.signup.confirm_placeholder')} isPassword />

            <PrimaryButton label={t('auth.signup.create_btn')} onPress={nextStep} style={styles.submitBtn} />
            
            <View style={styles.loginContainer}>
              <AppText variant="muted">{t('auth.signup.has_account')}</AppText>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <AppText colorToken={colors.blue} weight="bold">{t('auth.signup.login_link')}</AppText>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            {renderNavHeader(t('auth.signup.step2_nav'))}
            <View style={styles.headerProcess}>
              <AppText variant="h2" weight="bold" style={styles.stepTitle}>{t('auth.signup.step3_title')}</AppText>
            </View>

            <CustomInput label={t('auth.signup.business_label')} placeholder={t('auth.signup.business_placeholder')} value={businessName} onChangeText={setBusinessName} />
            <Dropdown 
              label={t('auth.signup.industry_label')} 
              placeholder={t('auth.signup.industry_placeholder')} 
              value={industry}
              options={industryOptions}
              onSelect={setIndustry}
            />
            <Dropdown 
              label={t('auth.signup.branch_count_label')} 
              placeholder={t('auth.signup.branch_count_placeholder')} 
              value={branchCount}
              options={branchCountOptions}
              onSelect={setBranchCount}
            />
            <CustomInput label={t('auth.signup.location_label')} placeholder={t('auth.signup.location_placeholder')} />

            <PrimaryButton label={t('auth.signup.confirm_btn')} onPress={handleFinalSignup} loading={isLoading} style={styles.submitBtn} />
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            {renderNavHeader(t('auth.signup.step2_nav'))}
            <View style={styles.headerProcess}>
              <AppText variant="h2" weight="bold" style={styles.stepTitle}>{t('auth.signup.step4_title')}</AppText>
            </View>

            <AppText style={styles.otpLabel}>{t('auth.signup.otp_label')}</AppText>
            <OTPInput onComplete={() => console.log('OTP complete')} />

            <PrimaryButton 
              label={t('auth.signup.verify_btn')} 
              onPress={async () => {
                // Developer Bypass: Sign in with mock credentials
                await signIn('dev-token-bypass', { id: 'dev-user', email: 'dev@opinor.app', businessName: businessName || "PAUL'S COFFEE" });
              }} 
              style={styles.submitBtn} 
            />
          </View>
        );

      case 5:
        return (
          <View style={[styles.stepContainer, styles.loadingCenter]}>
             <ProcessingDots />
          </View>
        );

      default:
        return null;
    }
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
          {renderStep()}
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
  stepContainer: {
    flex: 1,
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
  headerLarge: {
    marginBottom: 40,
  },
  titleLarge: {
    fontSize: 28,
  },
  headerProcess: {
    marginBottom: 40,
  },
  stepTitle: {
    fontSize: 24,
  },
  submitBtn: {
    marginTop: 20,
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
    fontSize: 12,
  },
  socialBtn: {
    marginBottom: 40,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  otpLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  loadingCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  }
});

