import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../../components/ui/AppText';
import { Bell, Mail } from 'lucide-react-native';
import { getSettings, updateSettings } from '../../../api/users';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAlertStore } from '../../../store/AlertStore';

export const NotificationSettingsScreen = () => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const showAlert = useAlertStore(state => state.showAlert);

  // Load actual server settings
  const { data, isLoading, isError } = useQuery({
    queryKey: ['userSettings'],
    queryFn: getSettings,
  });

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  // Sync state when data arrives
  useEffect(() => {
    if (data?.data) {
      setPushEnabled(!!data.data.pushNotifications);
      setEmailEnabled(!!data.data.emailNotifications);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
    },
    onError: (err: any) => {
      console.error('Failed to save setting:', err);
      showAlert({
        title: t('common.error') || 'Error',
        message: t('common.generic_error') || 'Failed to update setting. Please try again.',
        type: 'error'
      });
      // Revert states on error
      if (data?.data) {
        setPushEnabled(!!data.data.pushNotifications);
        setEmailEnabled(!!data.data.emailNotifications);
      }
    }
  });

  const handleTogglePush = (val: boolean) => {
    setPushEnabled(val);
    mutation.mutate({ pushNotifications: val });
  };

  const handleToggleEmail = (val: boolean) => {
    setEmailEnabled(val);
    mutation.mutate({ emailNotifications: val });
  };

  const SettingRow = ({ icon: Icon, title, toggleValue, onToggle }: any) => (
    <View style={[styles.settingRow, { 
      borderBottomColor: isDark ? '#374151' : '#F3F4F6' 
    }]}>
      <View style={styles.settingRowLeft}>
        <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(3, 135, 136, 0.1)' : '#F0F9F9' }]}>
          <Icon size={20} color="#038788" />
        </View>
        <AppText weight="bold" style={{ marginLeft: 16, color: colors.dark, fontSize: 16 }}>{title}</AppText>
      </View>
      
      <Switch 
        value={toggleValue} 
        onValueChange={onToggle}
        trackColor={{ false: '#D1D5DB', true: '#038788' }}
        thumbColor={'#FFFFFF'}
        style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }} 
        disabled={mutation.isPending || isLoading}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.dark : '#F8FAFC' }]}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.settingsCard, { backgroundColor: isDark ? '#2A2D31' : '#FFFFFF' }]}>
          {isLoading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
               <ActivityIndicator color="#038788" size="large" />
            </View>
          ) : (
            <>
              <SettingRow 
                icon={Bell} 
                title={t('profile.items.notifications') || 'Push Notifications'} 
                toggleValue={pushEnabled} 
                onToggle={handleTogglePush} 
              />
              <SettingRow 
                icon={Mail} 
                title={t('notifications.email') || 'Email Notifications'} 
                toggleValue={emailEnabled} 
                onToggle={handleToggleEmail} 
              />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 16 },
  settingsCard: {
    borderRadius: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingRowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
