import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Copy, MessageCircle, Share2 } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useUIStore } from '../../store/UIStore';

interface ShareBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheetModal | null>;
  url: string;
}

export const ShareBottomSheet: React.FC<ShareBottomSheetProps> = ({ 
  bottomSheetRef, 
  url 
}) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const { setTabBarHidden } = useUIStore();
  
  const snapPoints = useMemo(() => ['35%'], []);

  const handleSheetChange = useCallback((index: number) => {
    setTabBarHidden(index >= 0);
  }, [setTabBarHidden]);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(url);
    bottomSheetRef.current?.dismiss();
    // In a real app, you might show a toast here
  };

  const handleNativeShare = async () => {
    try {
      await Share.share({
        message: `${t('qr_code.title')}: ${url}`,
        url: url,
      });
      bottomSheetRef.current?.dismiss();
    } catch (error) {
      console.log(error);
    }
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsAtThreshold={0.1}
        appearsAtThreshold={0.2}
        opacity={0.5}
      />
    ),
    []
  );

  const ShareOption = ({ icon: Icon, label, onPress, color }: any) => (
    <TouchableOpacity 
      style={[styles.option, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }]} 
      onPress={onPress}
    >
      <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
        <Icon color={color} size={20} strokeWidth={2.5} />
      </View>
      <Text style={[styles.optionLabel, { color: isDark ? '#FFFFFF' : '#1F2937' }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChange}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: '#9CA3AF', width: 40 }}
      backgroundStyle={{ 
        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        borderRadius: 30,
      }}
    >
      <BottomSheetView style={styles.contentContainer}>
        <Text style={[styles.title, { color: colors.dark }]}>{t('qr_code.share')}</Text>
        
        <View style={styles.optionsGrid}>
          <ShareOption 
            icon={Copy} 
            label={t('qr_code.actions.copy')} 
            onPress={handleCopy}
            color="#038788"
          />
          <ShareOption 
            icon={MessageCircle} 
            label={t('qr_code.actions.whatsapp')} 
            onPress={handleNativeShare} // For now, native share is used for simplicity
            color="#25D366"
          />
          <ShareOption 
            icon={Share2} 
            label={t('qr_code.actions.other')} 
            onPress={handleNativeShare}
            color="#3B82F6"
          />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: 24,
    paddingTop: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
  },
  optionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  option: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
