import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  useWindowDimensions, ActivityIndicator, Alert, FlatList
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MessageCircle, ThumbsDown, Star, TrendingUp,
  ChevronLeft, ChevronRight, BarChart2, CheckCircle,
  AlertCircle
} from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { AppText } from '../../components/ui/AppText';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ReportsStackParamList } from '../../navigation/ReportsNavigator';
import { exportReportToPDF } from '../../services/ReportExportService';
import { useQuery } from '@tanstack/react-query';
import {
  getReportStatistics,
  getRatingsDistribution,
  getReportsHistory,
  ReportPeriod,
  ReportHistoryItem
} from '../../api/reports';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'Latest' | 'History';
type Nav = NativeStackNavigationProp<ReportsStackParamList, 'ReportsList'>;

const PERIODS: { label: string; val: ReportPeriod }[] = [
  { label: 'Today', val: 'today' },
  { label: 'This Week', val: 'week' },
  { label: 'This Month', val: 'month' },
];

// ─── ALL StyleSheets defined first — prevents TDZ issues ─────────────────────
const chartStyles = StyleSheet.create({
  xLbl:  { fontSize: 10, color: '#9CA3AF', textAlign: 'center', marginTop: 6 },
  yLbl:  { fontSize: 9,  color: '#9CA3AF', textAlign: 'right', position: 'absolute', right: 4 },
  grid:  { position: 'absolute', left: 0, right: 0, backgroundColor: 'rgba(150,150,150,0.18)' },
});

const kpiStyles = StyleSheet.create({
  card:   { borderRadius: 10, padding: 17, alignItems: 'center', justifyContent: 'center', minHeight: 130 },
  circle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  value:  { fontSize: 26, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  label:  { fontSize: 12, color: '#9CA3AF', textAlign: 'center', lineHeight: 18 },
});

const issStyles = StyleSheet.create({
  card:  { backgroundColor: '#FECACA', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  tag:   { fontSize: 10, fontWeight: '700', color: '#B91C1C', letterSpacing: 0.8, marginBottom: 6 },
  title: { fontSize: 16, color: '#1F2937', marginBottom: 4, fontWeight: '700', textTransform: 'capitalize' },
  sub:   { fontSize: 12, color: '#6B7280', lineHeight: 16 },
});

const histStyles = StyleSheet.create({
  card:  { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 16, marginBottom: 12, marginHorizontal: 24 },
  thumb: { width: 48, height: 48, borderRadius: 10, backgroundColor: '#282E32', alignItems: 'center', justifyContent: 'center' },
  month: { fontSize: 15, marginBottom: 4, fontWeight: '600' },
  count: { fontSize: 12, color: '#9CA3AF' },
  badge: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#038788', alignItems: 'center', justifyContent: 'center' },
});

const mainStyles = StyleSheet.create({
  container:    { flex: 1 },
  scroll:       { paddingHorizontal: 24, paddingBottom: 120 },
  title:        { fontSize: 22, textAlign: 'center', marginBottom: 20 },
  tabRow:       { flexDirection: 'row', gap: 10, marginBottom: 20 },
  tabPill:      { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 22 },
  tabLabel:     { fontSize: 15, textAlign: 'center' },
  periodRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  periodLabel:  { fontSize: 17, fontWeight: '600' },
  arrowBtn:     { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  kpiGrid:      { marginBottom: 24 },
  kpiRow:       { flexDirection: 'row', gap: 17 },
  sectionTitle: { fontSize: 15, marginBottom: 14, fontWeight: '600' },
  chartCard:    { borderRadius: 10, padding: 17, marginBottom: 24 },
  exportBtn:    { height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginTop: 12, marginBottom: 16 },
  exportLabel:  { fontSize: 16 },
  
  errorCard:    { padding: 24, borderRadius: 16, alignItems: 'center', marginTop: 40, marginHorizontal: 24 },
  errorMsg:     { marginTop: 16, marginBottom: 24, textAlign: 'center', lineHeight: 22, fontSize: 15 },
  retryBtn:     { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
});

// ─── Y-axis helper ───────────────────────────────────────────────────
function calcTicks(data: number[]): { ticks: number[]; maxTick: number } {
  const maxVal = Math.max(...data, 1);
  const maxTick = Math.max(Math.ceil(maxVal / 20) * 20, 20);
  const step = maxTick / 4;
  return { ticks: [step, step * 2, step * 3, step * 4], maxTick };
}

// ─── Vertical Bar Chart with Y-axis ───────────────────────────────────
const VerticalBarChart = ({
  data, labels, barWidth, trackHeight, barColor, trackColor,
}: {
  data: number[]; labels: string[];
  barWidth: number; trackHeight: number;
  barColor: string; trackColor: string;
}) => {
  const { ticks, maxTick } = calcTicks(data);
  return (
    <View style={{ flexDirection: 'row' }}>
      <View style={{ width: 28, height: trackHeight + 20 }}>
        {ticks.map((tick) => {
          const fromTop = trackHeight - (tick / maxTick) * trackHeight;
          return <Text key={tick} style={[chartStyles.yLbl, { top: fromTop - 6 }]}>{tick}</Text>;
        })}
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ height: trackHeight }}>
          {ticks.map((tick) => {
            const fromTop = trackHeight - (tick / maxTick) * trackHeight;
            return <View key={tick} style={[chartStyles.grid, { top: fromTop, height: StyleSheet.hairlineWidth }]} />;
          })}

          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: trackHeight }}>
            {data.map((val, i) => {
              const fillH = Math.max(Math.round((val / maxTick) * trackHeight), 8);
              return (
                <View key={i} style={{ flex: 1, alignItems: 'center', height: trackHeight, justifyContent: 'flex-end' }}>
                  <View style={{ width: barWidth, height: trackHeight, backgroundColor: trackColor, borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' }}>
                    <View style={{ width: barWidth, height: fillH, backgroundColor: barColor, borderRadius: 6 }} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginTop: 6 }}>
          {labels.map((label, i) => (
            <Text key={i} style={[chartStyles.xLbl, { flex: 1 }]} numberOfLines={1}>{label}</Text>
          ))}
        </View>
      </View>
    </View>
  );
};

// ─── Mini Donut ───────────────────────────────────────────────────────────────
const MiniDonut = ({ percent, size = 60 }: { percent: number; size?: number }) => {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (percent / 100) * circ;
  const cx = size / 2;
  return (
    <Svg width={size} height={size}>
      <Circle cx={cx} cy={cx} r={r} stroke="rgba(255,255,255,0.25)" strokeWidth={7} fill="none" />
      <Circle cx={cx} cy={cx} r={r} stroke="#FFFFFF" strokeWidth={7} fill="none" strokeDasharray={`${fill} ${circ - fill}`} strokeDashoffset={circ / 4} strokeLinecap="round" />
    </Svg>
  );
};

// ─── KPI Card (2×2) ───────────────────────────────────────────────────────────
const KPICard = ({ icon: Icon, iconBg, iconColor = '#FFFFFF', value, label, cardBg, cardW, numColor }: any) => (
  <View style={[kpiStyles.card, { backgroundColor: cardBg, width: cardW }]}>
    <View style={[kpiStyles.circle, { backgroundColor: iconBg }]}><Icon size={26} color={iconColor} strokeWidth={2} /></View>
    <AppText weight="bold" style={[kpiStyles.value, { color: numColor }]}>{value}</AppText>
    <AppText style={kpiStyles.label}>{label}</AppText>
  </View>
);

// ─── Issue Card ───────────────────────────────────────────────────────────────
const IssueCard = ({ periodVal, issue, percent }: { periodVal: ReportPeriod; issue: string; percent: number }) => {
  const { t } = useTranslation();
  const labels: Record<ReportPeriod, string> = {
    'today': t('reports.issues.tags.today'), 
    'week': t('reports.issues.tags.week'), 
    'month': t('reports.issues.tags.month'),
  };

  // i18n safely translate backend category string if it exists in locales
  const i18nKey = `reports.categories.${issue.toLowerCase().replace(/ /g, '_')}`;
  const displayIssue = t(i18nKey, { defaultValue: issue });

  return (
    <View style={issStyles.card}>
      <View style={{ flex: 1 }}>
        <Text style={issStyles.tag}>{labels[periodVal]}</Text>
        <Text style={issStyles.title}>{displayIssue}</Text>
        <Text style={issStyles.sub}>{t('reports.issues.mentioned_in', { percent })}</Text>
      </View>
      <MiniDonut percent={percent} />
    </View>
  );
};

// ─── History Report Card ──────────────────────────────────────────────────────
const HistoryCard = ({ item, cardBg, titleColor, onPress, isLatest = false }: { item: ReportHistoryItem, cardBg: string, titleColor: string, onPress: () => void, isLatest?: boolean }) => {
  const { t } = useTranslation();
  const displayDate = item.date;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[histStyles.card, { backgroundColor: cardBg }]}>
      <View style={histStyles.thumb}><BarChart2 size={22} color="#038788" strokeWidth={1.8} /></View>
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={[histStyles.month, { color: titleColor }]}>{displayDate}</Text>
        <Text style={histStyles.count}>{t('reports.history.feedbacks_count', { count: item.feedbackCount })}</Text>
      </View>
      {isLatest ? (
        <View style={histStyles.badge}><CheckCircle size={16} color="#FFFFFF" strokeWidth={2} /></View>
      ) : (
        <ChevronRight size={18} color="#6B7280" strokeWidth={2} />
      )}
    </TouchableOpacity>
  );
};

// ─── Reports Screen ────────────────────────────────────────────────────────────
export const ReportsScreen = () => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();

  const [activeTab, setActiveTab] = useState<Tab>('Latest');
  const [periodIdx, setPeriodIdx] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const activePeriod = PERIODS[periodIdx];

  // --- React Query Bindings ---
  // 1. Statistics & KPIs
  const { 
    data: stats, 
    isFetching: isStatsFetching, 
    isError: isStatsError, 
    refetch: refetchStats 
  } = useQuery({
    queryKey: ['reportStats', activePeriod.val],
    queryFn: () => getReportStatistics(activePeriod.val),
    placeholderData: (prev) => prev, 
    retry: 1,
  });

  // 2. Ratings Graph Distribution
  const { 
    data: distData, 
    refetch: refetchDist 
  } = useQuery({
    queryKey: ['reportDist', activePeriod.val],
    queryFn: () => getRatingsDistribution(activePeriod.val),
    placeholderData: (prev) => prev,
    retry: 1,
  });

  // 3. History FlatList
  const { 
    data: historyRes, 
    isError: isHistoryError, 
    isFetching: isHistoryFetching,
    refetch: refetchHistory 
  } = useQuery({
    queryKey: ['reportHistory'],
    queryFn: () => getReportsHistory(1, 100),
    staleTime: Infinity, 
    retry: 1,
  });

  const handleExport = async () => {
    if (!stats) return;
    try {
      setIsExporting(true);
      await exportReportToPDF({
        period: activePeriod.label,
        received: stats.totalFeedbacks,
        negative: stats.negativeCount,
        avgRating: stats.ratingOutOf5,
        growth: stats.trend,
        ratingDist: computedDist,
        activity: stats.activity,
        activityLabels: stats.activityLabels,
        issue: stats.issue,
        issuePercent: stats.issuePercent
      }, t);
    } catch (error) {
      Alert.alert(t('common.error'), t('reports.export_error'));
    } finally {
      setIsExporting(false);
    }
  };

  const getPeriodLabel = (val: ReportPeriod) => {
    switch (val) {
      case 'today': return t('reports.periods.today');
      case 'week': return t('reports.periods.week');
      case 'month': return t('reports.periods.month');
      default: return val;
    }
  };

  const getDayLabel = (d: string) => {
    return t(`dashboard.days.${d.toLowerCase()}`, { defaultValue: d });
  };

  // Convert raw DB decimal scores into structural buckets
  const computedDist = React.useMemo(() => {
    if (!distData) return [0, 0, 0, 0, 0];
    const buckets = [0, 0, 0, 0, 0];
    distData.forEach(d => {
      const bucketIdx = Math.max(1, Math.min(Math.floor(d.ratingScore), 5)) - 1;
      buckets[bucketIdx] += d.count;
    });
    return buckets;
  }, [distData]);

  // Theme tokens
  const cardBg     = isDark ? '#1E2227' : '#F7F7F8';
  const screenBg   = isDark ? colors.dark : colors.white;
  const trackColor = isDark ? '#2A2D31' : '#E5E7EB';
  const titleColor = isDark ? '#FFFFFF' : '#111827';
  const numColor   = isDark ? '#FFFFFF' : '#111827';
  const tabInact   = isDark ? '#1E2227' : '#F3F4F6';
  const barColor   = isDark ? '#42D599' : '#038788';
  const cardW      = (width - 48 - 17) / 2;

  // ─── Error State Renderer ───────────────────────────────────
  const renderError = (retryFn: () => void) => (
    <View style={[mainStyles.errorCard, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2' }]}>
      <AlertCircle size={40} color="#EF4444" />
      <AppText style={[mainStyles.errorMsg, { color: isDark ? '#FCA5A5' : '#991B1B' }]}>
        {t('reports.error_msg', { defaultValue: 'We couldn’t load your report data. Please check your connection or account status.' })}
      </AppText>
      <TouchableOpacity 
        style={[mainStyles.retryBtn, { backgroundColor: '#EF4444' }]} 
        onPress={retryFn}
        activeOpacity={0.8}
      >
        <AppText weight="bold" style={{ color: '#FFFFFF' }}>
          {t('common.retry', { defaultValue: 'Try Again' })}
        </AppText>
      </TouchableOpacity>
    </View>
  );

  const renderLatest = () => {
    // Intercept Errors before showing infinite ActivityIndicators
    if (isStatsError) {
      return renderError(() => { 
        refetchStats(); 
        refetchDist(); 
      });
    }

    if (!stats) return <ActivityIndicator size="large" color={colors.blue} style={{ marginTop: 50 }} />;
    
    return (
      <View style={[mainStyles.scroll, { paddingBottom: 120 }]}>
        <View style={mainStyles.periodRow}>
          <TouchableOpacity
            onPress={() => setPeriodIdx(i => Math.max(0, i - 1))}
            disabled={periodIdx === 0}
            style={[mainStyles.arrowBtn, { opacity: periodIdx === 0 ? 0.3 : 1 }]}>
            <ChevronLeft size={24} color={colors.blue} strokeWidth={2.5} />
          </TouchableOpacity>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AppText weight="semiBold" style={[mainStyles.periodLabel, { color: titleColor }]}>
              {getPeriodLabel(activePeriod.val)}
            </AppText>
            {isStatsFetching && <ActivityIndicator size="small" color={colors.blue} style={{ marginLeft: 8 }} />}
          </View>

          <TouchableOpacity
            onPress={() => setPeriodIdx(i => Math.min(PERIODS.length - 1, i + 1))}
            disabled={periodIdx === PERIODS.length - 1}
            style={[mainStyles.arrowBtn, { opacity: periodIdx === PERIODS.length - 1 ? 0.3 : 1 }]}>
            <ChevronRight size={24} color={colors.blue} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <View style={[mainStyles.kpiGrid, { gap: 17 }]}>
          <View style={mainStyles.kpiRow}>
            <KPICard icon={MessageCircle} iconBg="#22C55E"  value={String(stats.totalFeedbacks)} label={t('reports.kpis.received')}  cardBg={cardBg} cardW={cardW} numColor={numColor} />
            <KPICard icon={ThumbsDown}    iconBg="#F87171"  value={String(stats.negativeCount)} label={t('reports.kpis.negative')}  cardBg={cardBg} cardW={cardW} numColor={numColor} />
          </View>
          <View style={mainStyles.kpiRow}>
            <KPICard icon={Star}       iconBg="#93C5FD"             value={stats.ratingOutOf5} label={t('reports.kpis.avg_rating')}  cardBg={cardBg} cardW={cardW} numColor={numColor} />
            <KPICard icon={TrendingUp} iconBg="#C084FC" iconColor="#1F2937" value={stats.trend} label={t('reports.kpis.growth')} cardBg={cardBg} cardW={cardW} numColor={numColor} />
          </View>
        </View>

        <AppText weight="semiBold" style={[mainStyles.sectionTitle, { color: titleColor }]}>{t('reports.charts.rating_dist')}</AppText>
        <View style={[mainStyles.chartCard, { backgroundColor: cardBg }]}>
          <VerticalBarChart
            data={[...computedDist].reverse()} 
            labels={['1', '2', '3', '4', '5']}
            barWidth={12} trackHeight={157} barColor={barColor} trackColor={trackColor} />
        </View>

        {stats.activity && stats.activityLabels && stats.activity.length > 0 && (
          <>
            <AppText weight="semiBold" style={[mainStyles.sectionTitle, { color: titleColor }]}>{t('reports.charts.feedback_activity')}</AppText>
            <View style={[mainStyles.chartCard, { backgroundColor: cardBg }]}>
              <VerticalBarChart data={stats.activity} 
                labels={stats.activityLabels.map(l => l.startsWith('W') ? l : getDayLabel(l))}
                barWidth={24} trackHeight={170} barColor={barColor} trackColor={trackColor} />
            </View>
          </>
        )}

        {stats.negativeCount > 0 && (
          <IssueCard periodVal={activePeriod.val} issue={stats.issue} percent={stats.issuePercent} />
        )}

        <TouchableOpacity 
          style={[mainStyles.exportBtn, { backgroundColor: barColor, opacity: isExporting ? 0.7 : 1 }]} 
          activeOpacity={0.85}
          onPress={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator color={isDark ? '#111827' : '#FFFFFF'} size="small" />
          ) : (
            <Text style={[mainStyles.exportLabel, { color: isDark ? '#111827' : '#FFFFFF', fontWeight: '600' }]}>
              {t('reports.actions.export')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[mainStyles.container, { backgroundColor: screenBg, paddingTop: insets.top + 16 }]}>
        <AppText weight="bold" style={[mainStyles.title, { color: titleColor }]}>{t('reports.title')}</AppText>

        <View style={[mainStyles.tabRow, { paddingHorizontal: 24 }]}>
          {(['Latest', 'History'] as Tab[]).map(tabKey => (
            <TouchableOpacity key={tabKey} onPress={() => setActiveTab(tabKey)} activeOpacity={0.8}
              style={[mainStyles.tabPill, { backgroundColor: activeTab === tabKey ? colors.blue : tabInact }]}>
              <AppText style={[mainStyles.tabLabel, { color: activeTab === tabKey ? '#FFFFFF' : '#9CA3AF' }]}
                weight={activeTab === tabKey ? 'semiBold' : 'regular'}>
                {tabKey === 'Latest' ? t('reports.tabs.latest') : t('reports.tabs.history')}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'Latest' ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {renderLatest()}
          </ScrollView>
        ) : (
          <FlatList
            data={historyRes?.reports || []}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120, paddingTop: 4 }}
            ListEmptyComponent={
              isHistoryError ? renderError(() => refetchHistory()) : (
                isHistoryFetching ? (
                  <ActivityIndicator size="large" color={colors.blue} style={{ marginTop: 50 }} />
                ) : (
                  <AppText style={{ textAlign: 'center', marginTop: 40, color: '#9CA3AF' }}>
                    {t('reports.history_empty', { defaultValue: 'No history reports found.' })}
                  </AppText>
                )
              )
            }
            renderItem={({ item, index }) => (
              <HistoryCard item={item} cardBg={cardBg} titleColor={titleColor} isLatest={index === 0}
                onPress={() => navigation.navigate('ReportDetail', {
                  id: item.id, month: item.date.split(' ')[0], year: parseInt(item.date.split(' ')[1]),
                  total: item.feedbackCount, negative: 0,
                  avgRating: `${item.averageRating} / 5`, growth: '0%', 
                  ratingDist: [], activity: [],
                  activityLabels: [], issue: '', issuePercent: 0,
                })}
              />
            )}
          />
        )}
    </View>
  );
};
