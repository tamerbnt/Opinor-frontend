import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAlertStore } from '../../../store/AlertStore';
import { 
  User, 
  QrCode, 
  Building2,
  Lock,
  Globe,
  Moon,
  Bell,
  HardDrive,
  CircleHelp,
  FileText
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// ─── Constants ────────────────────────────────────────────────────────────────
// The dark header zone height (where the blob shapes + avatar overlap live)
const HEADER_ZONE_HEIGHT = 200;
// The avatar straddling offset (how much avatar hangs above white card)
const AVATAR_OVERLAP = 60;
const AVATAR_SIZE = 120;

import { updateBusinessInfo, deleteAccount as apiDeleteAccount } from '../../../api/users';

export const ProfileMainScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const userProfile = useAuthStore(state => state.userProfile);
  const signOut = useAuthStore(state => state.signOut);
  const showAlert = useAlertStore(state => state.showAlert);

  const handleDeleteAccount = () => {
    showAlert({
      title: t('profile.actions.delete_account') || "Delete Account",
      message: "Are you sure you want to permanently delete your account? This action cannot be undone.",
      type: 'error',
      buttons: [
        { text: t('profile.actions.cancel'), style: "cancel" },
        { 
          text: t('profile.actions.delete'), 
          style: "destructive",
          onPress: async () => {
            try {
              await apiDeleteAccount();
              await signOut();
            } catch (err: any) {
              console.error('Delete account error:', err);
              showAlert({
                title: t('common.error'),
                message: err.response?.data?.message || "Failed to delete account.",
                type: 'error'
              });
            }
          }
        }
      ]
    });
  };

  const handleClearCache = () => {
    showAlert({
      title: t('profile.actions.clear_cache_title'),
      message: t('profile.actions.clear_cache_msg'),
      type: 'warning',
      buttons: [
        { text: t('profile.actions.cancel'), style: "cancel" },
        { 
          text: t('profile.actions.clear'), 
          style: "destructive",
          onPress: () => console.log("Cache Cleared")
        }
      ]
    });
  };

  const SettingItem = ({ icon: Icon, label, onPress, isLast = false }: any) => (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={onPress}
      style={[
        styles.settingItem, 
        !isLast && { 
          borderBottomWidth: StyleSheet.hairlineWidth, 
          borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#E5E7EB' 
        }
      ]}
    >
      <View style={styles.itemLeft}>
        <Icon color="#038788" size={20} strokeWidth={2.2} />
        <Text style={[styles.itemLabel, { color: isDark ? '#FFFFFF' : '#1F2937' }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  const SettingsGroup = ({ title, children }: any) => (
    <View style={styles.groupContainer}>
      <Text style={[styles.groupTitle, { color: isDark ? '#9CA3AF' : '#4B5563' }]}>
        {title}
      </Text>
      <View style={[
        styles.card, 
        { backgroundColor: isDark ? colors.dark : '#F9FAFB' }
      ]}>
        {children}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1F2428' : '#FFFFFF' }]}>

      {/* ── Header Zone — Theme-aware background ── */}
      <View style={[
        styles.headerZone, 
        { 
          paddingTop: insets.top,
          backgroundColor: isDark ? '#111827' : '#F0F7F7'
        }
      ]}>

        {/* "Profile" title — dynamic color based on theme */}
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
          {t('profile.title')}
        </Text>

        {/* ── Background Shapes ── */}

        {/* Large blob: LEFT-CENTER — a big circle anchored left, partially clipped */}
        <View style={[styles.bgBlobLeft, { opacity: isDark ? 0.18 : 0.08 }]} />

        {/* Small decorative dots: CENTER-RIGHT cluster */}
        <View style={styles.bgDotLarge} />
        <View style={styles.bgDotSmall} />
      </View>

      {/* ── White Card + Avatar ── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Spacer that matches the dark zone height, minus the avatar overlap */}
        <View style={{ height: HEADER_ZONE_HEIGHT - AVATAR_OVERLAP }} />

        {/* White Card */}
        <View style={[
          styles.whiteCard,
          { backgroundColor: isDark ? '#1F2428' : '#FFFFFF' }
        ]}>
          
          {/* ── Avatar Block — straddles the boundary ── */}
          <View style={styles.profileHeader}>
            {/* Outer ring: matches white card bg to create visual separation from blob */}
            <View style={[styles.avatarOuterRing, { backgroundColor: isDark ? '#1F2428' : '#FFFFFF' }]}>
              {/* Teal bordered circle */}
              <View style={styles.avatarBorder}>
                {/* Inner teal background with app logo */}
                <View style={styles.avatarInner}>
                  <Image
                    source={userProfile?.logo ? { uri: userProfile.logo } : require('../../../../assets/new_logo.png')}
                    style={styles.avatarImage}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </View>

            <Text style={[styles.nameText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              {userProfile?.businessName || "PAUL'S COFFEE"}
            </Text>
          </View>

          {/* ── Settings Groups ── */}
          <View style={styles.menuContainer}>

            <SettingsGroup title={t('profile.groups.profile')}>
              <SettingItem 
                icon={User} 
                label={t('profile.items.edit_profile')}
                onPress={() => navigation.navigate('EditProfile')} 
              />
              <SettingItem 
                icon={QrCode} 
                label={t('profile.items.qr_code')} 
                onPress={() => navigation.navigate('QRCode')} 
              />
              <SettingItem 
                icon={Building2} 
                label={t('profile.items.business_info')} 
                onPress={() => navigation.navigate('BusinessInfo')} 
                isLast
              />
            </SettingsGroup>

            <SettingsGroup title={t('profile.groups.security')}>
              <SettingItem 
                icon={Lock} 
                label={t('profile.items.change_password')} 
                onPress={() => navigation.navigate('ChangePassword')} 
                isLast
              />
            </SettingsGroup>

            <SettingsGroup title={t('profile.groups.general')}>
              <SettingItem 
                icon={Globe} 
                label={t('profile.items.languages')} 
                onPress={() => navigation.navigate('Language')} 
              />
              <SettingItem 
                icon={Moon} 
                label={t('profile.items.appearance')} 
                onPress={() => navigation.navigate('Appearance')} 
              />
              <SettingItem 
                icon={Bell} 
                label={t('profile.items.notifications')} 
                onPress={() => navigation.navigate('NotificationsSettings')} 
              />
              <SettingItem 
                icon={HardDrive} 
                label={t('profile.items.clear_cache')} 
                onPress={handleClearCache} 
                isLast
              />
            </SettingsGroup>

            <SettingsGroup title={t('profile.groups.about')}>
              <SettingItem 
                icon={CircleHelp} 
                label={t('profile.items.help_support')} 
                onPress={() => navigation.navigate('Support')} 
              />
              <SettingItem 
                icon={FileText} 
                label={t('profile.items.legacies_policies')} 
                onPress={() => navigation.navigate('Legal')} 
                isLast
              />
            </SettingsGroup>

          </View>

          {/* ── Action Buttons ── */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: '#038788' }]}
              onPress={signOut}
            >
              <Text style={[styles.primaryButtonText, { color: '#FFFFFF' }]}>{t('profile.actions.logout')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.primaryButton, 
                { backgroundColor: isDark ? '#D9534F' : '#FEE2E2', marginTop: 12 }
              ]}
              onPress={handleDeleteAccount}
            >
              <Text style={[
                styles.primaryButtonText, 
                { color: isDark ? '#FFFFFF' : '#B91C1C' }
              ]}>{t('profile.actions.delete_account')}</Text>
            </TouchableOpacity>
          </View>
          
          {/* Bottom spacing to account for TabBar + Safe Area */}
          <View style={{ height: insets.bottom + 120 }} />
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#FFFFFF', // Initial Light Mode fallback
  },

  // ── Header Zone ──────────────────────────────────────────────────────
  headerZone: {
    width: '100%',
    height: HEADER_ZONE_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    zIndex: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    justifyContent: 'flex-start',
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    zIndex: 1,
  },

  // ── Background Blob Shapes ────────────────────────────────────────────────

  // Large blob: Massive circle anchored LEFT-CENTER, partially clipped off-screen
  // This matches the reference where a large dark teal shape fills the left side
  bgBlobLeft: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#038788',
    opacity: 0.18,               // Visible but not overpowering — dark zone gives contrast
    top: -60,
    left: -100,                  // Anchor left, clip the left side off-screen
  },

  // Larger green dot — CENTER-RIGHT area of the dark zone
  bgDotLarge: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#038788',
    opacity: 1,                  // Fully solid — stands out as accent dot
    top: 130,
    right: 80,
  },

  // Smaller dot — slightly above and to the left of the large dot
  bgDotSmall: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#038788',
    opacity: 0.6,
    top: 108,
    right: 110,
  },

  // ── Scroll + White Card ───────────────────────────────────────────────────
  scrollContent: {
    flexGrow: 1,
  },

  whiteCard: {
    flex: 1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 24,
    // Shadow to lift card off dark background
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },

  // ── Avatar Block ──────────────────────────────────────────────────────────
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: -AVATAR_OVERLAP,   // Dynamically calculated overlap
    zIndex: 20,
  },

  // Outer ring: same bg as white card — creates a visual "moat" between card and teal border
  avatarOuterRing: {
    padding: 6,
    borderRadius: (AVATAR_SIZE / 2) + 10,
  },

  // Teal border ring
  avatarBorder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    borderColor: '#038788',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  // Inner teal circle (brand background for the logo)
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: (AVATAR_SIZE / 2) - 6,
    backgroundColor: '#038788',  // Teal brand background for white logo
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarImage: {
    width: '65%',
    height: '65%',
  },

  nameText: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 14,
    letterSpacing: 0.5,
  },

  // ── Settings Menus ────────────────────────────────────────────────────────
  menuContainer: { marginBottom: 24 },
  groupContainer: { marginBottom: 28 },
  groupTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    paddingHorizontal: 20,
    elevation: 0,
    shadowOpacity: 0,
  },
  settingItem: {
    paddingVertical: 18,
    justifyContent: 'center',
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  itemLabel: { fontSize: 14, fontWeight: '600', marginLeft: 16 },

  // ── Action Buttons ────────────────────────────────────────────────────────
  actionButtonsContainer: { marginBottom: 40, paddingHorizontal: 16 },
  primaryButton: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { fontSize: 16, fontWeight: '700' },
});
