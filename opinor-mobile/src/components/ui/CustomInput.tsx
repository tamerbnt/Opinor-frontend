import React, { useState } from 'react';
import { View, TextInput, TextInputProps, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText } from './AppText';
import { useTheme } from '../../theme/ThemeContext';
import { Radii } from '../../constants/Theme';
import { Eye, EyeOff } from 'lucide-react-native';

export interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  error,
  style,
  isPassword = false,
  ...rest
}) => {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <AppText weight="semiBold" style={styles.label}>
          {label}
        </AppText>
      )}
      <View style={[
        styles.inputWrapper,
        {
          backgroundColor: isDark ? colors.sombreCards : colors.grisLight,
          borderColor: error ? colors.brique : isFocused ? colors.blue : 'transparent',
          borderWidth: error || isFocused ? 1 : 0,
          height: style && (style as any).height ? (style as any).height : 49,
        }
      ]}>
        <TextInput
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={isDark ? '#6B7280' : '#A0AEC0'}
          secureTextEntry={isPassword && !isPasswordVisible}
          style={[
            styles.input,
            {
              color: isDark ? colors.white : '#1A1D21',
            },
            style,
          ]}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            activeOpacity={0.7}
          >
            {isPasswordVisible ? (
              <EyeOff color={isDark ? '#6B7280' : '#A0AEC0'} size={20} />
            ) : (
              <Eye color={isDark ? '#6B7280' : '#A0AEC0'} size={20} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <AppText variant="caption" colorToken={colors.brique} style={styles.errorText}>
          {error}
        </AppText>
      )}
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
    width: '100%',
    borderRadius: Radii.input, // Hardcoded 15px logic
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontFamily: 'Inter_400Regular', // Ensures the actual form inputs bypass system typefaces
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 4,
  }
});
