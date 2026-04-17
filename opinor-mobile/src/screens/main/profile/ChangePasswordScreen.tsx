import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { InputField } from '../../../components/ui/InputField';
import { AppText } from '../../../components/ui/AppText';
import { changePassword } from '../../../api/auth';

export const ChangePasswordScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation
  const isNewPasswordValid = newPassword.length >= 8;
  // Must be valid length and strictly match new password
  const isConfirmValid = isNewPasswordValid && newPassword === confirmPassword && currentPassword.length > 0;

  const handleUpdate = async () => {
    if (!isConfirmValid) return;
    
    setIsSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword });
      Alert.alert(t('common.success') || 'Success', t('change_password.success') || 'Your password was changed successfully.');
      navigation.goBack();
    } catch (err: any) {
      console.error('Change password failed', err);
      const msg = err.response?.data?.message || err.message || 'Failed to change password. Ensure your current password is correct.';
      Alert.alert(t('common.error') || 'Security Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <View style={[styles.container, { backgroundColor: isDark ? colors.dark : colors.pageBg }]}>
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <AppText variant="muted" style={styles.helperText}>
            {t('change_password.helper_text') || 'Please enter your current password to authorize this action.'}
          </AppText>

          <View style={[styles.formCard, { backgroundColor: isDark ? '#2A2D31' : '#FFFFFF' }]}>
            <InputField
              label={t('change_password.current_password') || 'Current Password'}
              placeholder={t('change_password.current_password_placeholder') || 'Enter current password'}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            
            <View style={styles.divider} />

            <InputField
              label={t('change_password.new_password') || 'New Password'}
              placeholder={t('change_password.new_password_placeholder') || 'Enter new password'}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              isValid={isNewPasswordValid}
            />

            <InputField
              label={t('change_password.confirm_password') || 'Confirm Password'}
              placeholder={t('change_password.confirm_password_placeholder') || 'Re-enter new password'}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              isValid={isConfirmValid && confirmPassword.length > 0}
            />
          </View>

          {/* Inline Action Button */}
          <View style={styles.footer}>
            {!isConfirmValid && newPassword.length > 0 && confirmPassword.length > 0 && (
              <AppText variant="muted" style={{ textAlign: 'center', marginBottom: 12, color: colors.error || '#EF4444' }}>
                {newPassword.length < 8 ? (t('change_password.too_short') || 'Password too short') : (t('change_password.mismatch') || 'Passwords do not match')}
              </AppText>
            )}
            <TouchableOpacity 
              style={[
                styles.updateButton, 
                { backgroundColor: isConfirmValid && !isSubmitting ? '#038788' : (isDark ? '#374151' : '#D1D5DB') }
              ]}
              onPress={handleUpdate}
              disabled={!isConfirmValid || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <AppText variant="buttonText" style={[styles.updateButtonText, { color: isConfirmValid ? '#FFFFFF' : '#9CA3AF' }]}>
                  {t('change_password.submit') || 'Update Password'}
                </AppText>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 32, flexGrow: 1 },
  helperText: {
    marginBottom: 24,
    lineHeight: 20,
  },
  formCard: {
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    opacity: 0.5,
    marginVertical: 12,
  },
  footer: {
    marginTop: 32,
    paddingBottom: 24,
  },
  updateButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  updateButtonText: { fontSize: 16, fontWeight: '700' },
});
