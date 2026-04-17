import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, KeyboardAvoidingView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuthStore } from '../../../store/useAuthStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';
import { InputField } from '../../../components/ui/InputField';
import { AppText } from '../../../components/ui/AppText';
import { Dropdown } from '../../../components/ui/Dropdown';
import { updateBusinessInfo } from '../../../api/users';

export const BusinessInfoScreen = () => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const userProfile = useAuthStore(state => state.userProfile);
  const updateUserProfile = useAuthStore(state => state.updateUserProfile);

  const [logo, setLogo] = useState(userProfile?.logo || 'https://via.placeholder.com/150');
  const [businessName, setBusinessName] = useState(userProfile?.businessName || '');
  const [industry, setIndustry] = useState(userProfile?.businessCategory || '');
  const [location, setLocation] = useState(userProfile?.businessAddress || '');

  const [isSaving, setIsSaving] = useState(false);

  const industryOptions = [
    { label: t('auth.signup.industries.RESTAURANT') || 'Restaurant', value: 'RESTAURANT' },
    { label: t('auth.signup.industries.BEACH') || 'Beach', value: 'BEACH' },
    { label: t('auth.signup.industries.CLINIC') || 'Clinic', value: 'CLINIC' },
    { label: t('auth.signup.industries.CAFE') || 'Cafe', value: 'CAFE' },
    { label: t('auth.signup.industries.HOTEL') || 'Hotel', value: 'HOTEL' },
    { label: t('auth.signup.industries.RETAIL') || 'Retail', value: 'RETAIL' },
    { label: t('auth.signup.industries.OTHER') || 'Other', value: 'OTHER' },
  ];

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
       Alert.alert("Permission Required", "You've refused to allow this app to access your photos!");
       return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const newLogo = result.assets[0].uri;
      setLogo(newLogo);
    }
  };

  const isDirty = useMemo(() => {
    return businessName !== (userProfile?.businessName || '') ||
           industry !== (userProfile?.businessCategory || '') ||
           location !== (userProfile?.businessAddress || '') ||
           logo !== (userProfile?.logo || 'https://via.placeholder.com/150');
  }, [businessName, industry, location, logo, userProfile]);

  const isValid = businessName.length > 2;

  const handleSave = async () => {
    if (!isDirty) {
      navigation.goBack();
      return;
    }

    if (!isValid) return;

    setIsSaving(true);
    try {
      const payload = {
        businessName,
        businessCategory: industry,
        businessAddress: location,
        logo,
      };

      const response = await updateBusinessInfo(payload);
      
      updateUserProfile({
        businessName: response.data.businessName,
        businessCategory: response.data.businessCategory,
        businessAddress: response.data.businessAddress,
        logo: response.data.logo,
      });

      Alert.alert(t('common.success') || 'Success', t('business_info.success_msg') || 'Business updated successfully.');
      navigation.goBack();

    } catch (err: any) {
      console.error('Update business info error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to update business info.';
      Alert.alert(t('common.error') || 'Error', errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { backgroundColor: isDark ? colors.dark : colors.pageBg }]}>
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Upload Container */}
          <View style={styles.avatarSection}>
            <View style={[styles.avatarWrapper, { borderColor: '#038788' }]}>
              <Image source={{ uri: logo }} style={styles.avatarImage} />
              <TouchableOpacity 
                activeOpacity={0.8}
                style={[styles.cameraBadge, { backgroundColor: '#038788' }]}
                onPress={pickImage}
              >
                <Camera color="#FFF" size={16} />
              </TouchableOpacity>
            </View>
            <AppText variant="muted" style={{ marginTop: 12 }}>
              {t('business_info.change_logo') || 'Change Logo'}
            </AppText>
          </View>

          {/* Form */}
          <View style={[styles.formCard, { backgroundColor: isDark ? '#2A2D31' : '#FFFFFF' }]}>
            <InputField
              label={t('business_info.labels.name') || 'Business Name'}
              placeholder={t('business_info.placeholders.name') || 'Paul\'s Coffee'}
              value={businessName}
              onChangeText={setBusinessName}
              autoCapitalize="words"
            />

            <Dropdown
              label={t('business_info.labels.industry') || 'Industry'}
              placeholder={t('business_info.placeholders.industry') || 'Select Industry'}
              value={industry}
              options={industryOptions}
              onSelect={setIndustry}
            />

            <InputField
              label={t('business_info.labels.location') || 'Location'}
              placeholder={t('business_info.placeholders.location') || 'City, Address'}
              value={location}
              onChangeText={setLocation}
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
                  {t('business_info.submit') || 'Update Business'}
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
  avatarSection: { alignItems: 'center', marginBottom: 40 },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    padding: 3,
    position: 'relative',
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 60 },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
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
  footer: {
    marginTop: 32,
    paddingBottom: 24,
  },
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
