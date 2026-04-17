import React from 'react';
import { View, StyleSheet, TouchableOpacity, Share, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShareBottomSheet } from '../../../components/qr/ShareBottomSheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { AppText } from '../../../components/ui/AppText';
import { Share2 } from 'lucide-react-native';

export const QRCodeScreen = () => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const userProfile = useAuthStore(state => state.userProfile);
  const bottomSheetRef = React.useRef<BottomSheetModal>(null);

  const profileUrl = `https://opinor.app/u/${userProfile?.id || 'guest'}`;

  const handleShare = () => {
    bottomSheetRef.current?.present();
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.dark : colors.pageBg }]}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[
          styles.qrCard, 
          { backgroundColor: isDark ? '#2A2D31' : '#FFFFFF' }
        ]}>
          <AppText variant="h3" style={[styles.qrTitle, { color: colors.dark }]}>
            {t('qr_code.title')}
          </AppText>
          
          <View style={styles.qrContainer}>
            <QRCode
              value={profileUrl}
              size={200}
              color={isDark ? '#FFFFFF' : '#000000'}
              backgroundColor="transparent"
            />
          </View>

          <AppText variant="muted" style={styles.qrUrl}>
            {profileUrl}
          </AppText>
        </View>

        <TouchableOpacity 
          style={[styles.shareButton, { backgroundColor: '#038788' }]}
          onPress={handleShare}
        >
          <Share2 color="#FFFFFF" size={20} style={{ marginRight: 10 }} />
          <AppText variant="buttonText" style={styles.shareButtonText}>
            {t('qr_code.share')}
          </AppText>
        </TouchableOpacity>
      </ScrollView>

      <ShareBottomSheet 
        bottomSheetRef={bottomSheetRef} 
        url={profileUrl} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  qrCard: {
    width: '100%',
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 40,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 32,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 24,
  },
  qrUrl: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    width: '100%',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
