import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { CheckCircle2, Eye, EyeOff } from 'lucide-react-native';

interface InputFieldProps extends TextInputProps {
  label: string;
  isValid?: boolean;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  isValid, 
  error, 
  style, 
  secureTextEntry,
  ...props 
}) => {
  const { colors, isDark } = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // If secureTextEntry is true initially, we treat it as a password field
  const isPasswordField = secureTextEntry === true;
  // It is actually secure only if it's a password field AND the user hasn't toggled it visible
  const currentlySecure = isPasswordField && !isPasswordVisible;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
        {label}
      </Text>
      
      <View style={[
        styles.inputWrapper, 
        { 
          backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
          borderColor: error ? '#EF4444' : (isDark ? '#374151' : '#E5E7EB'),
        }
      ]}>
        <TextInput
          style={[
            styles.input, 
            { color: colors.text },
            style
          ]}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={currentlySecure}
          {...props}
        />
        
        {isPasswordField ? (
          <TouchableOpacity 
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.iconButton}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            {isPasswordVisible ? (
              <EyeOff color="#9CA3AF" size={20} />
            ) : (
              <Eye color="#9CA3AF" size={20} />
            )}
          </TouchableOpacity>
        ) : isValid ? (
          <CheckCircle2 color="#038788" size={18} style={styles.validIcon} />
        ) : null}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  validIcon: {
    marginLeft: 8,
  },
  iconButton: {
    padding: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
