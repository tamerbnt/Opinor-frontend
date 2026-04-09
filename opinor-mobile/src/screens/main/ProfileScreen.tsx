import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../components/ui/AppText';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../store/useAuthStore';
import { Camera, ChevronRight, Bell, Shield, CircleHelp, Mail } from 'lucide-react-native';

export const ProfileScreen = () => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const signOut = useAuthStore(state => state.signOut);
  const userProfile = useAuthStore(state => state.userProfile);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  // Future integration gateway for expo-image-picker
  const handleUpdateAvatar = () => {
    Alert.alert('Update Avatar', 'Avatar upload camera flow invoked directly via native ImagePicker.');
  };

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of your session safely?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => signOut() }
    ]);
  };

  const SettingRow = ({ icon: Icon, title, isToggle, toggleValue, onToggle }: any) => (
    <View style={[styles.settingRow, { borderBottomColor: isDark ? colors.sombreCards : colors.grisLight }]}>
      <View style={styles.settingRowLeft}>
        <View style={[styles.iconBox, { backgroundColor: isDark ? colors.sombreCards : colors.grisLight }]}>
          <Icon size={20} color={isDark ? colors.white : colors.dark} />
        </View>
        <AppText weight="semiBold" style={{ marginLeft: 16 }}>{title}</AppText>
      </View>
      
      {isToggle ? (
        <Switch 
          value={toggleValue} 
          onValueChange={onToggle}
          trackColor={{ false: '#D1D5DB', true: colors.blue }}
          thumbColor={'#FFFFFF'}
          // Forcing 0.8 Scale directly reduces standard iOS/Android bounded switches to match the 22x11 extracted parameter smoothly.
          style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} 
        />
      ) : (
        <ChevronRight size={20} color="#9CA3AF" />
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.dark : colors.white }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Header Block Alignment */}
        <AppText variant="h1" style={styles.headerTitle}>Profile</AppText>

        {/* Global Component Identity Block */}
        <View style={[styles.profileCard, { backgroundColor: isDark ? colors.sombreCards : colors.grisLight }]}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: userProfile?.avatar || 'https://via.placeholder.com/150' }}
              style={styles.avatarImage}
            />
            <TouchableOpacity 
              style={[styles.editBadge, { backgroundColor: colors.blue }]}
              onPress={handleUpdateAvatar}
              activeOpacity={0.8}
            >
              <Camera size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          <AppText variant="h2" weight="bold" style={styles.nameText}>
            {userProfile?.businessName || "PAUL'S COFFEE"}
          </AppText>
          <AppText variant="muted">
            {userProfile?.email || "admin@paulscoffee.com"}
          </AppText>
        </View>

        {/* Configurable Action Matricies */}
        <View style={styles.settingsGroup}>
          <AppText variant="caption" colorToken="#9CA3AF" style={styles.groupLabel}>NOTIFICATIONS</AppText>
          <SettingRow 
            icon={Bell} 
            title="Push Notifications" 
            isToggle 
            toggleValue={pushEnabled} 
            onToggle={setPushEnabled} 
          />
          <SettingRow 
            icon={Mail} 
            title="Email Reports" 
            isToggle 
            toggleValue={emailEnabled} 
            onToggle={setEmailEnabled} 
          />
        </View>

        <View style={styles.settingsGroup}>
          <AppText variant="caption" colorToken="#9CA3AF" style={styles.groupLabel}>ACCOUNT</AppText>
          <SettingRow icon={Shield} title="Security & Privacy" />
          <SettingRow icon={CircleHelp} title="Help & Support" />
        </View>

        {/* Secure Termination Gateways */}
        <View style={styles.logoutWrapper}>
          <PrimaryButton 
            label="Log Out" 
            variant="danger" 
            onPress={handleLogout}
          />
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  headerTitle: {
    marginBottom: 24,
  },
  profileCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  nameText: {
    marginBottom: 4,
  },
  settingsGroup: {
    marginBottom: 32,
  },
  groupLabel: {
    marginBottom: 16,
    marginLeft: 8,
    letterSpacing: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutWrapper: {
    marginTop: 20,
    marginBottom: 40,
  }
});
