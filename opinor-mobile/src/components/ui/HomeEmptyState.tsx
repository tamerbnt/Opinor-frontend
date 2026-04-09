import React from 'react';
import { View, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { AppText } from './AppText';
import { PrimaryButton } from './PrimaryButton';
import { useTheme } from '../../theme/ThemeContext';

export const HomeEmptyState = ({ onShowQR }: { onShowQR: () => void }) => {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();

  // Explicit pixel widths — avoids alignSelf: stretch fighting with alignItems: center
  const illustrationSize = width * 0.65;
  const buttonWidth      = width - 60; // 30px margin on each side

  return (
    <View style={styles.wrapper}>

      {/* ── Oval teal glow behind the illustration ── */}
      <View
        style={[
          styles.glowLayer,
          {
            width: illustrationSize * 0.85,
            backgroundColor: isDark
              ? 'rgba(3,135,136,0.12)'
              : 'rgba(178,223,224,0.55)',
          },
        ]}
      />

      {/* ── Theme-aware sad-face illustration ── */}
      <Image
        source={
          isDark
            ? require('../../../assets/Illustration dark.png')
            : require('../../../assets/Illustration light.png')
        }
        style={{ width: illustrationSize, height: illustrationSize }}
        resizeMode="contain"
      />

      {/* ── Text cluster ── */}
      <View style={styles.textBlock}>
        <AppText weight="bold" style={styles.title}>
          No Feedbacks Yet
        </AppText>

        <AppText
          variant="body"
          colorToken="#6B7280"
          style={styles.subtitle}
        >
          Your customers' feedbacks will appear here once you start using your QR code.
        </AppText>
      </View>

      {/* ── CTA pill — explicit pixel width, no alignSelf: stretch ── */}
      <PrimaryButton
        label="View and share our QR"
        onPress={onShowQR}
        style={[styles.button, { width: buttonWidth }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  /*
   * wrapper: column, centred horizontally.
   * No justifyContent here — vertical placement is handled by the
   * parent DashboardScreen's emptyContainer.
   */
  wrapper: {
    width: '100%',
    alignItems: 'center',
  },

  /* Horizontal oval glow sitting just behind the illustration */
  glowLayer: {
    position: 'absolute',
    height: 22,
    top: '32%',          // vertically centred within the illustration
    borderRadius: 999,
    shadowColor: '#038788',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
  },

  textBlock: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 28,
    paddingHorizontal: 36,
  },
  title: {
    fontSize: 22,
    letterSpacing: 0,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 13,
  },
  button: {
    borderRadius: 28, // wide pill — overrides PrimaryButton's default 20px
  },
});
