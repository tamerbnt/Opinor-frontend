import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../components/ui/AppText';
import { SurfaceCard } from '../../components/ui/SurfaceCard';
import { FloatingActionPill } from '../../components/ui/FloatingActionPill';
import { HomeEmptyState } from '../../components/ui/HomeEmptyState';
import { useTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../store/useAuthStore';
import { Sun } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

export const DashboardScreen = () => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const userProfile = useAuthStore(state => state.userProfile);
  const [filter, setFilter] = useState<'Day' | 'Week' | 'Month'>('Day');

  // Toggle: false = empty state (first-run), true = populated (mock data)
  const [hasData] = useState(false);

  const data   = [60, 80, 60, 110, 90, 140, 120];
  const labels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.dark : colors.white }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 20,   // ← dynamic safe-area top
            paddingBottom: 120,            // ← clears the tab bar
          }
        ]}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <View style={styles.greetingRow}>
              <Sun size={14} color={colors.blue} />
              <AppText
                variant="caption"
                colorToken={colors.blue}
                weight="bold"
                style={styles.greetingText}
              >
                GOOD MORNING
              </AppText>
            </View>

            {/* Business name: 22px bold — NOT using h1 variant (32px) */}
            <AppText
              weight="bold"
              style={[styles.businessTitle, { color: isDark ? colors.white : '#111827' }]}
            >
              {userProfile?.businessName || "PAUL'S COFFEE"}
            </AppText>
          </View>

          {/* Avatar badge: 46×46, coral border, teal bg makes white logo visible */}
          <View style={[styles.avatarOuter, { borderColor: colors.brique }]}>
            <View style={[styles.avatarInner, { backgroundColor: colors.blue }]}>
              <Image
                source={require('../../../assets/white vertical 2 (2).png')}
                style={styles.avatarImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        {/* ── Content area ── */}
        {hasData ? (
          <>
            <AppText weight="bold" style={styles.sectionTitle}>
              Average Satisfaction Score
            </AppText>

            <SurfaceCard style={styles.gaugeCard}>
              <View style={styles.gaugeContainer}>
                <Svg width="157.2" height="110.62" viewBox="0 0 157.2 110.62">
                  <Path
                    d="M 15 100 A 70 70 0 0 1 142.2 100"
                    fill="none"
                    stroke={isDark ? '#2A2D31' : '#E5E7EB'}
                    strokeWidth="20"
                    strokeLinecap="round"
                  />
                  <Path
                    d="M 15 100 A 70 70 0 0 1 115 35"
                    fill="none"
                    stroke={colors.blue}
                    strokeWidth="20"
                    strokeLinecap="round"
                  />
                </Svg>
                <View style={styles.gaugeCenterText}>
                  <AppText variant="h2" weight="bold">4.3 / 5</AppText>
                </View>
              </View>
            </SurfaceCard>

            <SurfaceCard style={styles.chartCard}>
              <View style={styles.chartHeaderRow}>
                <AppText weight="bold" style={styles.chartTitle}>Received feedbacks</AppText>
                <View style={styles.filterContainer}>
                  <FloatingActionPill label="Day"   active={filter === 'Day'}   onPress={() => setFilter('Day')} />
                  <FloatingActionPill label="Week"  active={filter === 'Week'}  onPress={() => setFilter('Week')} />
                  <FloatingActionPill label="Month" active={filter === 'Month'} onPress={() => setFilter('Month')} />
                </View>
              </View>

              <View style={styles.barChartContainer}>
                {data.map((value, index) => (
                  <View key={index} style={styles.barColumn}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          { height: `${(value / 150) * 100}%`, backgroundColor: colors.blue }
                        ]}
                      />
                    </View>
                    <AppText variant="caption" colorToken="#9CA3AF" style={styles.barLabel}>
                      {labels[index]}
                    </AppText>
                  </View>
                ))}
              </View>
            </SurfaceCard>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <HomeEmptyState onShowQR={() => console.log('QR: navigate to QR screen')} />
          </View>
        )}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  scrollContent: {
    paddingHorizontal: 24,
    flexGrow: 1,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  greetingText: {
    fontSize: 10,
    letterSpacing: 1.5,
  },
  businessTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0,
  },

  /* Avatar — 46×46, coral 1.5px border, 2px white inner ring */
  avatarOuter: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    padding: 2,               // white inner gap
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },

  /* Empty state — top-pull layout, illustration stays in upper-centre zone */
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,       // gentle pull toward upper portion of remaining space
    paddingBottom: 40,    // balances breathing room above tab bar
  },

  /* Populated: Gauge */
  sectionTitle:   { fontSize: 16, marginBottom: 16 },
  gaugeCard:      { alignItems: 'center', paddingVertical: 30, marginBottom: 24 },
  gaugeContainer: { width: 157.2, height: 110.62, position: 'relative', justifyContent: 'flex-end', alignItems: 'center' },
  gaugeCenterText:{ position: 'absolute', bottom: 0, alignItems: 'center' },

  /* Populated: Bar chart */
  chartCard:       { padding: 20, borderRadius: 20, marginBottom: 24 },
  chartHeaderRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  chartTitle:      { fontSize: 15 },
  filterContainer: { flexDirection: 'row', gap: 6 },
  barChartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 150, paddingTop: 10 },
  barColumn:       { alignItems: 'center', width: 24 },
  barTrack:        { width: 11, height: 120, justifyContent: 'flex-end', borderRadius: 5.5, overflow: 'hidden' },
  barFill:         { width: 11, borderRadius: 5.5 },
  barLabel:        { marginTop: 10, fontSize: 10 },
});
