import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ProfileMainScreen } from '../screens/main/profile/ProfileMainScreen';
import { EditProfileScreen } from '../screens/main/profile/EditProfileScreen';
import { QRCodeScreen } from '../screens/main/profile/QRCodeScreen';
import { LanguageScreen } from '../screens/main/profile/LanguageScreen';
import { AppearanceScreen } from '../screens/main/profile/AppearanceScreen';
import { NotificationSettingsScreen } from '../screens/main/profile/NotificationSettingsScreen';
import { BusinessInfoScreen } from '../screens/main/profile/BusinessInfoScreen';
import { ChangePasswordScreen } from '../screens/main/profile/ChangePasswordScreen';
import { SupportScreen } from '../screens/main/profile/SupportScreen';
import { LegalScreen } from '../screens/main/profile/LegalScreen';

import { useTheme } from '../theme/ThemeContext';

const Stack = createNativeStackNavigator();

export const ProfileNavigator = () => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: isDark ? colors.dark : '#FFFFFF',
        },
        headerTintColor: isDark ? '#FFFFFF' : '#111827',
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileMainScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{ title: t('nav.edit_profile') }} 
      />
      <Stack.Screen 
        name="QRCode" 
        component={QRCodeScreen} 
        options={{ title: t('nav.qr_code') }} 
      />
      <Stack.Screen 
        name="BusinessInfo" 
        component={BusinessInfoScreen} 
        options={{ title: t('nav.business_info') }} 
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen} 
        options={{ title: t('nav.change_password') }} 
      />
      <Stack.Screen 
        name="Language" 
        component={LanguageScreen} 
        options={{ title: t('nav.language') }} 
      />
      <Stack.Screen 
        name="Appearance" 
        component={AppearanceScreen} 
        options={{ title: t('nav.appearance') }} 
      />
      <Stack.Screen 
        name="NotificationsSettings" 
        component={NotificationSettingsScreen} 
        options={{ title: t('nav.notifications') }} 
      />
      <Stack.Screen 
        name="Support" 
        component={SupportScreen} 
        options={{ title: t('nav.support') }} 
      />
      <Stack.Screen 
        name="Legal" 
        component={LegalScreen} 
        options={{ title: t('nav.legal') }} 
      />
    </Stack.Navigator>
  );
};
