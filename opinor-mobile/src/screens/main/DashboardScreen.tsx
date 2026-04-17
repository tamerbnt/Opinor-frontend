import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { AppText } from '../../components/ui/AppText';
import { SurfaceCard } from '../../components/ui/SurfaceCard';
import { HomeEmptyState } from '../../components/ui/HomeEmptyState';
import { useTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../store/useAuthStore';
import { Sun, Star, AlertCircle, Moon, Sunset } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { AchievementCard } from '../../components/ui/AchievementCard';
import { Skeleton } from '../../components/ui/SkeletonLoader';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { getStartupData, getFeedbackChart } from '../../api/dashboard';
import { getCurrentProfile } from '../../api/auth';

export const DashboardScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const [filter, setFilter] = useState<'day' | 'week' | 'month'>('week');

  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { userProfile: storeProfile, updateUserProfile } = useAuthStore();
  
  const today = new Date();
  const formattedDate = today.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : i18n.language, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // ── API Queries ──
  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const data = await getCurrentProfile();
      if (data) updateUserProfile(data);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { 
    data: startupData, 
    isLoading: isStartupLoading, 
    isError: isStartupError,
    refetch: refetchStartup 
  } = useQuery({
    queryKey: ['dashboardStartup'],
    queryFn: getStartupData,
  });

  const summary = startupData?.summary;
  const initialChart = startupData?.chart;

  const { 
    data: filterChart, 
    isFetching: isChartFetching 
  } = useQuery({
    queryKey: ['feedbackChart', filter],
    queryFn: () => getFeedbackChart(filter),
    enabled: !!startupData && filter !== 'week',
  });

  const chart = filterChart ?? initialChart;

  const isNewUser = useMemo(() => {
    if (!storeProfile?.createdAt) return false;
    try {
      const created = new Date(storeProfile.createdAt).getTime();
      const now = new Date().getTime();
      // Account is "new" if it was created in the last 15 minutes
      // We use Math.abs to handle small clock skew between client and server
      return Math.abs(now - created) < 1000 * 60 * 15;
    } catch (e) {
      return false;
    }
  }, [storeProfile?.createdAt]);

  const isLoading = isStartupLoading;
  const isError = isStartupError;
  const isChartLoading = isChartFetching && filter !== 'week';
  const hasData = (summary?.totalFeedbacksThisMonth ?? 0) > 0;
  
  // Fast-track empty state:
  // 1. If we HAVE data, never show empty state.
  // 2. If we are NEW, show empty state immediately (optimistic).
  // 3. Otherwise, fallback to standard logic (wait for loading/error).
  const showEmptyState = useMemo(() => {
    if (hasData) return false;
    if (isNewUser) return true;
    return !isStartupLoading && !isStartupError && !hasData;
  }, [hasData, isNewUser, isStartupLoading, isStartupError]);

  const handleRetry = () => {
    refetchStartup();
  };

  // ── Calculations ──
  const { greeting, GreetingIcon } = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { greeting: t('dashboard.greetings.morning'), GreetingIcon: Sun };
    if (hour < 18) return { greeting: t('dashboard.greetings.afternoon'), GreetingIcon: Sunset };
    return { greeting: t('dashboard.greetings.evening'), GreetingIcon: Moon };
  }, [t]);

  const gaugePercentage = useMemo(() => {
    const score = summary?.averageRating ?? 0;
    return Math.round((score / 5) * 100);
  }, [summary?.averageRating]);

  const getSatisfactoryArc = (percentage: number) => {
    const radius = 90;
    const centerX = 110;
    const centerY = 115;
    const safePercentage = Math.min(Math.max(percentage, 0.1), 100);
    const angle = 180 - (safePercentage / 100) * 180;
    const rad = (angle * Math.PI) / 180;
    const x = centerX + radius * Math.cos(rad);
    const y = centerY - radius * Math.sin(rad);
    
    return `M 20 115 A ${radius} ${radius} 0 ${safePercentage > 100 ? 1 : 0} 1 ${x} ${y}`;
  };

  const chartInfo = useMemo(() => {
    if (!chart?.feedbackTrend) return { data: [], labels: [] };

    return {
      data: chart.feedbackTrend.map(item => item.count),
      labels: chart.feedbackTrend.map(item => {
        if (filter === 'day') return item.label ?? '';
        if (filter === 'week') {
          const d = new Date(item.date);
          const days = [
            t('dashboard.days.sun'),
            t('dashboard.days.mon'),
            t('dashboard.days.tue'),
            t('dashboard.days.wed'),
            t('dashboard.days.thu'),
            t('dashboard.days.fri'),
            t('dashboard.days.sat')
          ];
          return days[d.getDay()];
        }
        const d = new Date(item.date);
        return `${d.getDate()}/${d.getMonth() + 1}`;
      })
    };
  }, [chart, filter, t]);

  // ── Render Helpers ──
  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <View style={styles.greetingRow}>
          <GreetingIcon size={14} color={colors.blue} />
          <AppText variant="caption" colorToken={colors.blue} weight="bold" style={styles.greetingText}>
            {greeting}
          </AppText>
        </View>
        <AppText weight="bold" style={[styles.businessTitle, { color: isDark ? colors.white : '#111827' }]}>
          {profile?.businessName || storeProfile?.businessName || t('common.loading')}
        </AppText>
      </View>

      <TouchableOpacity 
        onPress={() => navigation.navigate('Profile')}
        style={[styles.avatarOuter, { borderColor: colors.brique }]}
        activeOpacity={0.8}
      >
        <View style={[styles.avatarInner, { backgroundColor: colors.blue }]}>
          <Image
            source={profile?.logo ? { uri: profile.logo } : (storeProfile?.logo ? { uri: storeProfile.logo } : require('../../../assets/new_logo.png'))}
            style={styles.avatarImage}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderGauge = () => {
    if (isLoading) {
      return (
        <SurfaceCard style={[styles.gaugeCard, { backgroundColor: isDark ? colors.sombreCards : '#F7F7F8' }]}>
          <Skeleton width={120} height={14} style={{ marginBottom: 20, alignSelf: 'flex-start' }} />
          <View style={styles.gaugeContainer}>
             <Skeleton width={180} height={180} borderRadius={90} style={{ position: 'absolute', top: -30 }} />
          </View>
        </SurfaceCard>
      );
    }

    return (
      <SurfaceCard style={[styles.gaugeCard, { backgroundColor: isDark ? colors.sombreCards : '#F7F7F8' }]}>
        <View style={styles.gaugeHeader}>
          <AppText colorToken={isDark ? colors.textSecondary : '#6B7280'} style={styles.dateText}>
            {formattedDate}
          </AppText>
        </View>
        <View style={styles.gaugeContainer}>
          <Svg width="220" height="150" viewBox="0 0 220 150">
            <Path
              d="M 20 115 A 90 90 0 0 1 200 115"
              fill="none"
              stroke={isDark ? '#2A2D31' : '#F0F0F0'}
              strokeWidth="20"
              strokeLinecap="round"
            />
            <Path
              d={getSatisfactoryArc(gaugePercentage)}
              fill="none"
              stroke={colors.blue}
              strokeWidth="20"
              strokeLinecap="round"
            />
          </Svg>
          <View style={styles.gaugeCenterText}>
            <Star size={26} color={colors.blue} strokeWidth={2.5} style={{ marginBottom: 4 }} />
            <AppText weight="bold" style={{ fontSize: 26, color: isDark ? colors.white : colors.text }}>
              {summary?.averageRating?.toFixed(1) ?? '0.0'} / 5
            </AppText>
          </View>
        </View>
      </SurfaceCard>
    );
  };

  const renderChart = () => {
    if (isChartLoading) {
      return (
        <SurfaceCard style={[styles.chartCard, { backgroundColor: isDark ? colors.sombreCards : '#F7F7F8' }]}>
          <Skeleton width={150} height={20} style={{ marginBottom: 24 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 140 }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} width={20} height={Math.random() * 100 + 40} style={{ alignSelf: 'flex-end' }} />
            ))}
          </View>
        </SurfaceCard>
      );
    }

    const { data, labels } = chartInfo;
    const maxVal = Math.max(...data, 10);
    const step = maxVal / 5;
    const yAxisLabels = [maxVal, maxVal - step, maxVal - step * 2, maxVal - step * 3, maxVal - step * 4, 0].map(v => Math.round(v));

    return (
      <SurfaceCard style={[styles.chartCard, { backgroundColor: isDark ? colors.sombreCards : '#F7F7F8' }]}>
        <View style={styles.chartHeaderRow}>
          <AppText weight="bold" style={styles.chartTitle}>{t('dashboard.received_feedbacks')}</AppText>
          <View style={[styles.filterGroup, { backgroundColor: isDark ? colors.grisLight : '#F4F5F7' }]}>
            {(['day', 'week', 'month'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setFilter(p)}
                style={[styles.miniPill, filter === p && { backgroundColor: colors.blue }]}
              >
                <AppText 
                  style={[styles.miniPillText, { color: filter === p ? '#FFFFFF' : (isDark ? colors.textSecondary : colors.blue) }]}
                  weight={filter === p ? 'bold' : 'semiBold'}
                >
                  {t(`dashboard.filters.${p}`)}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.chartMainContent}>
          <View style={styles.yAxis}>
            {yAxisLabels.map((val) => (
              <AppText key={val} style={styles.yAxisText} colorToken="#9CA3AF">{val}</AppText>
            ))}
          </View>

          <View style={styles.barChartContainer}>
            {data.map((value, index) => (
              <View key={index} style={styles.barColumn}>
                <View style={[styles.barTrack, { backgroundColor: isDark ? '#2A2D31' : '#F0F0F0' }]}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${(value / maxVal) * 100}%`, backgroundColor: colors.blue }
                    ]}
                  />
                </View>
                {filter !== 'month' && (
                  <AppText variant="caption" colorToken="#9CA3AF" style={[styles.barLabel, { fontSize: filter === 'day' ? 7 : 9 }]}>
                    {labels[index]}
                  </AppText>
                )}
              </View>
            ))}
          </View>
        </View>
      </SurfaceCard>
    );
  };

  const renderStats = () => {
    if (isLoading) {
      return (
        <View style={{ flexDirection: 'row', marginTop: 16 }}>
          <Skeleton width={150} height={100} style={{ marginRight: 12 }} />
          <Skeleton width={150} height={100} style={{ marginRight: 12 }} />
          <Skeleton width={150} height={100} />
        </View>
      );
    }

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementsScroll}>
        <AchievementCard 
          type="positive" 
          value={summary?.positiveCount ?? 0} 
          label={t('dashboard.stats.positive_feedbacks')} 
          style={{ marginRight: 12 }} 
        />
        <AchievementCard 
          type="negative" 
          value={summary?.totalFeedbacksToday ?? 0} 
          label={t('dashboard.stats.negative_feedbacks')} 
          style={{ marginRight: 12 }} 
        />
        <AchievementCard 
          type="positive" 
          value={(summary?.responseRate ?? 0) + '%'} 
          label={t('dashboard.stats.response_rate')} 
        />
      </ScrollView>
    );
  };

  // ── Error State (Premium Overhaul) ──
  if (isError && !isNewUser) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? colors.dark : colors.white, paddingTop: insets.top }]}>
        <View style={styles.errorContent}>
          <View style={[styles.errorIconCircle, { backgroundColor: colors.brique + '15' }]}>
            <AlertCircle size={48} color={colors.brique} />
          </View>
          <AppText weight="bold" style={styles.errorTitle}>
            {t('common.error_title')}
          </AppText>
          <AppText variant="body" colorToken={colors.textSecondary} style={styles.errorDesc}>
            {t('common.error_desc')}
          </AppText>
          <PrimaryButton 
            label={t('common.retry')} 
            onPress={handleRetry} 
            style={styles.retryBtn} 
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.dark : colors.white }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}

        {showEmptyState ? (
          <View style={styles.emptyContainer}>
            <HomeEmptyState onShowQR={() => navigation.navigate('Profile', { screen: 'QRCode' })} />
          </View>
        ) : (
          <>
            <AppText weight="bold" style={styles.sectionTitle}>{t('dashboard.satisfaction_score')}</AppText>
            {renderGauge()}
            
            {renderChart()}

            <AppText weight="bold" style={styles.sectionTitle}>{t('dashboard.last_achievements')}</AppText>
            {renderStats()}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, flexGrow: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 },
  greetingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 },
  greetingText: { fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase' },
  businessTitle: { fontSize: 22, fontWeight: '700' },
  avatarOuter: { width: 46, height: 46, borderRadius: 23, borderWidth: 1.5, padding: 2, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  avatarInner: { width: '100%', height: '100%', borderRadius: 20, overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, marginBottom: 16 },
  gaugeCard: { alignItems: 'center', paddingVertical: 20, marginBottom: 24, paddingHorizontal: 16, borderRadius: 20 },
  gaugeHeader: { alignSelf: 'flex-start', marginBottom: 10 },
  dateText: { fontSize: 11 },
  gaugeContainer: { width: 220, height: 150, position: 'relative', justifyContent: 'flex-end', alignItems: 'center' },
  gaugeCenterText: { position: 'absolute', bottom: 12, alignItems: 'center' },
  chartCard: { padding: 20, borderRadius: 20, marginBottom: 24 },
  chartHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  chartTitle: { fontSize: 15 },
  filterGroup: { flexDirection: 'row', borderRadius: 8, padding: 2 },
  miniPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, minWidth: 45, alignItems: 'center' },
  miniPillText: { fontSize: 10 },
  chartMainContent: { flexDirection: 'row', alignItems: 'flex-start', height: 180, writingDirection: 'ltr' },
  yAxis: { justifyContent: 'space-between', height: 145, marginRight: 12, paddingVertical: 2 },
  yAxisText: { fontSize: 9, textAlign: 'right', width: 24 },
  barChartContainer: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 170, paddingTop: 10, paddingHorizontal: 4, writingDirection: 'ltr' },
  barColumn: { alignItems: 'center', width: '12%' },
  barTrack: { width: 14, height: 140, justifyContent: 'flex-end', borderRadius: 8, overflow: 'hidden' },
  barFill: { width: 14, borderRadius: 8 },
  barLabel: { marginTop: 10, fontSize: 10 },
  achievementsScroll: { paddingRight: 24, paddingBottom: 20, marginTop: 16 },

  /* Error State Styles */
  errorContent: { flex: 1, paddingHorizontal: 40, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  errorIconCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  errorTitle: { fontSize: 20, marginBottom: 12, textAlign: 'center' },
  errorDesc: { textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  retryBtn: { width: '80%' },
});
