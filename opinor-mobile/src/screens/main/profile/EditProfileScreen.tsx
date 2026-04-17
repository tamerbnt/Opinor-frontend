import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { InputField } from '../../../components/ui/InputField';
import { useAuthStore } from '../../../store/useAuthStore';
import { AppText } from '../../../components/ui/AppText';
import { ShieldCheck } from 'lucide-react-native';
import { updateProfile } from '../../../api/users';

export const EditProfileScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  
  const userProfile = useAuthStore(state => state.userProfile);
  const updateUserProfile = useAuthStore(state => state.updateUserProfile);

  // Initialize Name safely from Backend schema (firstName + lastName)
  const initialName = [userProfile?.firstName, userProfile?.lastName].filter(Boolean).join(' ') || '';
  
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  
  // Read Only
  const company = userProfile?.businessName || '';

  const [isSaving, setIsSaving] = useState(false);

  // Validation
  const isNameValid = name.length > 2;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = phone.length > 8;

  // Dirty check to prevent useless API calls
  const isDirty = useMemo(() => {
    return name !== initialName || 
           phone !== (userProfile?.phone || '') || 
           email !== (userProfile?.email || '');
  }, [name, phone, email, initialName, userProfile]);

  const isValid = isNameValid && isEmailValid && isPhoneValid;

  const handleSave = async () => {
    if (!isDirty) {
      navigation.goBack();
      return;
    }

    if (!isValid) return;

    setIsSaving(true);
    try {
      const parts = name.trim().split(' ');
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';

      const payload = {
        firstName,
        lastName,
        email,
        phone,
      };

      const response = await updateProfile(payload);
      
      // Sync UI RAM state immediately with API response
      updateUserProfile({
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email,
        phone: response.data.phone,
      });

      Alert.alert(t('common.success') || 'Success', t('edit_profile.success_msg') || 'Profile updated successfully.');
      navigation.goBack();

    } catch (err: any) {
      console.error('Update profile error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to update profile.';
      Alert.alert(t('common.error') || 'Error', errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardView} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { backgroundColor: isDark ? colors.dark : '#F8FAFC' }]}>
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Identity Protection Banner matching design elements */}
          <View style={[styles.secureBanner, { backgroundColor: isDark ? 'rgba(3, 135, 136, 0.1)' : '#F0F9F9' }]}>
            <ShieldCheck color="#038788" size={24} style={{ marginRight: 12 }} />
            <AppText variant="body" style={{ flex: 1, color: isDark ? '#9CA3AF' : '#4B5563' }}>
              {t('edit_profile.banner')}
            </AppText>
          </View>

          <View style={[styles.formCard, { backgroundColor: isDark ? '#2A2D31' : '#FFFFFF' }]}>
            <InputField
              label={t('edit_profile.labels.name') || 'FullName'}
              placeholder={t('edit_profile.placeholders.name') || 'John Doe'}
              value={name}
              onChangeText={setName}
              isValid={isNameValid}
              autoCapitalize="words"
            />
            
            <InputField
              label={t('edit_profile.labels.phone') || 'Phone'}
              placeholder={t('edit_profile.placeholders.phone') || '+1234567890'}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              isValid={isPhoneValid}
            />

            <InputField
              label={t('edit_profile.labels.email') || 'Email'}
              placeholder={t('edit_profile.placeholders.email') || 'email@example.com'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              isValid={isEmailValid}
            />

            <InputField
              label={t('edit_profile.labels.company') || 'Company'}
              placeholder={t('edit_profile.placeholders.company') || 'Business Name'}
              value={company}
              editable={false}
              style={{ color: '#9CA3AF' }}
            />
          </View>

          {/* Inline Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[
                styles.saveButton, 
                { backgroundColor: (!isDirty || !isValid || isSaving) ? (isDark ? '#374151' : '#D1D5DB') : '#038788' }
              ]}
              onPress={handleSave}
              disabled={!isDirty || !isValid || isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <AppText variant="buttonText" style={{ color: (!isDirty || !isValid) ? '#9CA3AF' : '#FFFFFF' }}>
                  {t('edit_profile.update') || 'Update Profile'}
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
  keyboardView: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 16, flexGrow: 1 },
  secureBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  formCard: {
    padding: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  footer: { marginTop: 32, paddingBottom: 24 },
  saveButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#038788',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
});
