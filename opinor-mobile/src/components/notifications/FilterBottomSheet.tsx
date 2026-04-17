import React, { useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { RadioButton } from '../ui/RadioButton';
import { useUIStore } from '../../store/UIStore';

export type FilterOption = 'newest' | 'older' | 'read' | 'unread';

interface FilterBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheetModal | null>;
  selectedFilter: FilterOption;
  onApply: (filter: FilterOption) => void;
}

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({ 
  bottomSheetRef, 
  selectedFilter, 
  onApply 
}) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const { setTabBarHidden } = useUIStore();
  
  // Local state for the temporary selection before "Apply"
  const [tempFilter, setTempFilter] = React.useState<FilterOption>(selectedFilter);

  const handleSheetChange = useCallback((index: number) => {
    // Sync the tempFilter state to the actively selected one purely ONLY when opening
    if (index >= 0) {
      setTempFilter(selectedFilter);
      setTabBarHidden(true);
    } else {
      setTabBarHidden(false);
    }
  }, [selectedFilter, setTabBarHidden]);

  const snapPoints = useMemo(() => ['45%'], []);

  const handleApply = () => {
    onApply(tempFilter);
    bottomSheetRef.current?.dismiss();
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
        borderRadius: 30, // 100% fidelity: 30px radius
      }}
    >
      <BottomSheetView style={styles.contentContainer}>
        <Text style={[styles.title, { color: colors.dark }]}>{t('notifications_screen.sort_by')}</Text>
        
        <View style={styles.optionsContainer}>
          <RadioButton 
            label={t('feedbacks.sort_options.newest') || 'Newest'} 
            selected={tempFilter === 'newest'} 
            onPress={() => setTempFilter('newest')} 
          />
          <RadioButton 
            label={t('feedbacks.sort_options.older') || 'Older'} 
            selected={tempFilter === 'older'} 
            onPress={() => setTempFilter('older')} 
          />
          <RadioButton 
            label={t('feedbacks.sort_options.read') || 'Read'} 
            selected={tempFilter === 'read'} 
            onPress={() => setTempFilter('read')} 
          />
          <RadioButton 
            label={t('feedbacks.sort_options.unread') || 'Unread'} 
            selected={tempFilter === 'unread'} 
            onPress={() => setTempFilter('unread')} 
          />
        </View>

        <TouchableOpacity 
          style={[styles.applyButton, { backgroundColor: '#038788' }]}
          onPress={handleApply}
        >
          <Text style={styles.applyButtonText}>{t('notifications_screen.actions.apply')}</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  optionsContainer: {
    marginBottom: 32,
  },
  applyButton: {
    width: '100%',
    height: 56,
    borderRadius: 28, // Rounded pill shape
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
