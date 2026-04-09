import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, useWindowDimensions } from 'react-native';
import { AppText } from '../../components/ui/AppText';
import { CustomInput } from '../../components/ui/CustomInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../store/useAuthStore';
import { SocialButton } from '../../components/ui/SocialButton';
import { ArrowLeft } from 'lucide-react-native';


export const LoginScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  
  // Constrain width for web fidelity
  const containerWidth = width > 500 ? 390 : width;
  const signIn = useAuthStore(state => state.signIn);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    // Developer Bypass: Mocking authentication for rapid UI/UX verification
    setTimeout(async () => {
      await signIn('dev-token-bypass', { businessName: "PAUL'S COFFEE" });
      setIsLoading(false);
    }, 800);
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
            <ArrowLeft color={colors.dark} size={24} />
          </TouchableOpacity>
          <AppText weight="semiBold" style={styles.navTitle}>Login</AppText>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.header}>
          <AppText variant="h1" weight="bold" style={styles.title}>Login</AppText>
        </View>


        {/* Dynamic Themed Inputs */}
        <CustomInput
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <CustomInput
          label="Password"
          placeholder="Enter your password"
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
            Forgot Password?
          </AppText>
        </TouchableOpacity>

        <PrimaryButton 
          label="Login" 
          onPress={handleLogin} 
          loading={isLoading} 
          style={styles.submitBtn} 
        />

        <View style={styles.dividerContainer}>
          <View style={[styles.dividerLine, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />
          <AppText variant="caption" style={styles.dividerText}>Or continue with</AppText>
          <View style={[styles.dividerLine, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />
        </View>

        <SocialButton 
          label="Continue with Google" 
          onPress={() => console.log('Google Login')} 
          style={styles.socialBtn}
        />

        {/* Conversion Logic */}
        <View style={styles.signupContainer}>
          <AppText variant="muted">Don't have an account? </AppText>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')} activeOpacity={0.7}>
            <AppText variant="body" colorToken={colors.blue} weight="bold">
              Sign Up
            </AppText>
          </TouchableOpacity>
        </View>
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
  }
});

