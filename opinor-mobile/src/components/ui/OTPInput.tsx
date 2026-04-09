import React, { useRef, useState } from 'react';
import { View, StyleSheet, TextInput, useWindowDimensions } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export const OTPInput = ({ onComplete }: { onComplete?: (code: string) => void }) => {
  const { colors, isDark } = useTheme();
  const [code, setCode] = useState(['', '', '', '']);
  const inputs = useRef<TextInput[]>([]);

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 3) {
      inputs.current[index + 1].focus();
    }

    if (newCode.every(val => val !== '')) {
      onComplete?.(newCode.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <View style={styles.container}>
      {code.map((digit, i) => (
        <View key={i} style={[
          styles.cell,
          {
            backgroundColor: isDark ? '#2A2D31' : '#F0F0F0',
            borderColor: digit ? '#038788' : 'transparent',
            borderWidth: digit ? 1 : 0,
          }
        ]}>
          <TextInput
            ref={(ref) => { inputs.current[i] = ref!; }}
            style={[styles.input, { color: colors.dark }]}
            maxLength={1}
            keyboardType="number-pad"
            value={digit}
            onChangeText={(text) => handleChange(text, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            textAlign="center"
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  cell: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    fontSize: 24,
    fontWeight: 'bold',
    width: '100%',
  }
});
