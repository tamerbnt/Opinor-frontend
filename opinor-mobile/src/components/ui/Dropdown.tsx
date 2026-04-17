import React, { useMemo, useCallback, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { AppText } from './AppText';
import { useTheme } from '../../theme/ThemeContext';
import { ChevronDown } from 'lucide-react-native';
import { RadioButton } from './RadioButton';
import { Radii } from '../../constants/Theme';
import { useUIStore } from '../../store/UIStore';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  label?: string;
  placeholder?: string;
  value?: string;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  error?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  placeholder,
  value,
  options,
  onSelect,
  error,
}) => {
  const { colors, isDark } = useTheme();
  const { setTabBarHidden } = useUIStore();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const selectedOption = useMemo(() => 
    options.find(opt => opt.value === value),
    [options, value]
  );

  const snapPoints = useMemo(() => {
    // Dynamically calculate height based on options count (approx 60px per option + header/footer)
    const estimatedHeight = Math.min(85, 20 + options.length * 10);
    return [`${estimatedHeight}%`];
  }, [options]);

  const handleOpen = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const handleSelect = useCallback((val: string) => {
    onSelect(val);
    bottomSheetRef.current?.dismiss();
  }, [onSelect]);

  const handleSheetChange = useCallback((index: number) => {
    setTabBarHidden(index >= 0);
  }, [setTabBarHidden]);

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
    <View style={styles.container}>
      {label && (
        <AppText weight="semiBold" style={styles.label}>
          {label}
        </AppText>
      )}

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleOpen}
        style={[
          styles.inputWrapper,
          {
            backgroundColor: isDark ? colors.sombreCards : colors.grisLight,
            borderColor: error ? colors.brique : 'transparent',
            borderWidth: error ? 1 : 0,
          }
        ]}
      >
        <AppText 
          style={[
            styles.valueText, 
            { color: selectedOption ? colors.text : (isDark ? '#6B7280' : '#A0AEC0') }
          ]}
        >
          {selectedOption ? selectedOption.label : (placeholder || 'Select option')}
        </AppText>
        <ChevronDown color={isDark ? '#6B7280' : '#A0AEC0'} size={20} />
      </TouchableOpacity>

      {error && (
        <AppText variant="caption" colorToken={colors.brique} style={styles.errorText}>
          {error}
        </AppText>
      )}

      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChange}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: isDark ? '#4B5563' : '#9CA3AF', width: 40 }}
        backgroundStyle={{ 
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          borderRadius: 30,
        }}
      >
        <BottomSheetView style={styles.sheetContent}>
          <AppText weight="bold" style={[styles.sheetTitle, { color: colors.text }]}>
            {label || 'Select'}
          </AppText>
          
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.optionsList}
          >
            {options.map((option) => (
              <RadioButton
                key={option.value}
                label={option.label}
                selected={value === option.value}
                onPress={() => handleSelect(option.value)}
              />
            ))}
          </ScrollView>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 49,
    borderRadius: Radii.input,
    paddingHorizontal: 16,
  },
  valueText: {
    fontSize: 16,
  },
  errorText: {
    marginTop: 4,
  },
  sheetContent: {
    flex: 1,
    padding: 24,
    paddingTop: 12,
  },
  sheetTitle: {
    fontSize: 20,
    marginBottom: 20,
  },
  optionsList: {
    paddingBottom: 20,
  }
});
