import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { AppText } from '../../components/ui/AppText';
import { CustomInput } from '../../components/ui/CustomInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useTheme } from '../../theme/ThemeContext';
import { SocialButton } from '../../components/ui/SocialButton';
import { OTPInput } from '../../components/ui/OTPInput';
import { ProcessingDots } from '../../components/ui/ProcessingDots';
import { ArrowLeft } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';

export const SignupScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
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
              <AppText variant="h1" weight="bold" style={styles.titleLarge}>Create Account</AppText>
            </View>

            <CustomInput
              label="Email"
              placeholder="Enter your email address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <PrimaryButton 
              label="Continue with email" 
              onPress={nextStep} 
              style={styles.submitBtn} 
            />

            <View style={styles.dividerContainer}>
              <View style={[styles.dividerLine, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />
              <AppText variant="caption" style={styles.dividerText}>Or continue with</AppText>
              <View style={[styles.dividerLine, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />
            </View>

            <SocialButton 
              label="Continue with Google" 
              onPress={() => console.log('Google Auth')} 
              style={styles.socialBtn}
            />

            <View style={styles.loginContainer}>
              <AppText variant="muted">Already have an account? </AppText>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <AppText colorToken={colors.blue} weight="bold">Login</AppText>
              </TouchableOpacity>
            </View>
          </View>
        );
      
      case 2:
        return (
          <View style={styles.stepContainer}>
            {renderNavHeader('Sign up')}
            <View style={styles.headerProcess}>
              <AppText variant="h2" weight="bold" style={styles.stepTitle}>Complete your account</AppText>
            </View>

            <CustomInput label="Full Name" placeholder="Enter your full name" value={name} onChangeText={setName} />
            <CustomInput label="Phone number" placeholder="Enter your phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <CustomInput label="Password" placeholder="Create a strong password" value={password} onChangeText={setPassword} isPassword />
            <CustomInput label="Confirm password" placeholder="Repeat your password" isPassword />

            <PrimaryButton label="Create account" onPress={nextStep} style={styles.submitBtn} />
            
            <View style={styles.loginContainer}>
              <AppText variant="muted">Already have an account? </AppText>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <AppText colorToken={colors.blue} weight="bold">Login</AppText>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            {renderNavHeader('Sign up')}
            <View style={styles.headerProcess}>
              <AppText variant="h2" weight="bold" style={styles.stepTitle}>Business details</AppText>
            </View>

            <CustomInput label="Business name" placeholder="Enter your business name" value={businessName} onChangeText={setBusinessName} />
            <CustomInput label="Industry Type" placeholder="Real Estate" />
            <CustomInput label="Team size" placeholder="10 - 20" />
            <CustomInput label="Location / City" placeholder="Casablanca, Morocco" />

            <PrimaryButton label="Confirm" onPress={handleFinalSignup} loading={isLoading} style={styles.submitBtn} />
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            {renderNavHeader('Sign up')}
            <View style={styles.headerProcess}>
              <AppText variant="h2" weight="bold" style={styles.stepTitle}>Enter your code</AppText>
            </View>

            <AppText style={styles.otpLabel}>Code</AppText>
            <OTPInput onComplete={() => console.log('OTP complete')} />

            <PrimaryButton 
              label="Verify" 
              onPress={async () => {
                // Developer Bypass: Sign in with mock credentials
                await signIn('dev-token-bypass', { businessName: businessName || "PAUL'S COFFEE" });
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

