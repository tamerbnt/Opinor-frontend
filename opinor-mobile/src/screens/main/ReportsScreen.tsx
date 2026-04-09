import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MessageCircle, ThumbsDown, Star, TrendingUp,
  ChevronLeft, ChevronRight, BarChart2, CheckCircle,
} from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { AppText } from '../../components/ui/AppText';
import { useTheme } from '../../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ReportsStackParamList } from '../../navigation/ReportsNavigator';

// ─── Types ────────────────────────────────────────────────────────────────────
type Period = 'Today' | 'This Week' | 'This Month';
type Tab    = 'Latest' | 'History';
type Nav    = NativeStackNavigationProp<ReportsStackParamList, 'ReportsList'>;
const PERIODS: Period[] = ['Today', 'This Week', 'This Month'];

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
  title: { fontSize: 16, color: '#1F2937', marginBottom: 4, fontWeight: '700' },
  sub:   { fontSize: 12, color: '#6B7280', lineHeight: 16 },
});

const histStyles = StyleSheet.create({
  card:  { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 16, marginBottom: 12 },
  thumb: { width: 48, height: 48, borderRadius: 10, backgroundColor: '#282E32', alignItems: 'center', justifyContent: 'center' },
  month: { fontSize: 15, marginBottom: 4, fontWeight: '600' },
  count: { fontSize: 12, color: '#9CA3AF' },
  badge: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#038788', alignItems: 'center', justifyContent: 'center' },
});

const mainStyles = StyleSheet.create({
  container:    { flex: 1 },
  scroll:       { paddingHorizontal: 24, paddingBottom: 120 },
  title:        { fontSize: 22, textAlign: 'center', marginBottom: 20 },
  // Tab pills — full-width centered split (flex:1 per pill)
  tabRow:       { flexDirection: 'row', gap: 10, marginBottom: 20 },
  tabPill:      { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 22 },
  tabLabel:     { fontSize: 15, textAlign: 'center' },
  // Period navigator
  periodRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  periodLabel:  { fontSize: 17, fontWeight: '600' },
  arrowBtn:     { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  // KPI grid
  kpiGrid:      { marginBottom: 24 },
  kpiRow:       { flexDirection: 'row', gap: 17 },
  // Charts
  sectionTitle: { fontSize: 15, marginBottom: 14, fontWeight: '600' },
  chartCard:    { borderRadius: 10, padding: 17, marginBottom: 24 },
  // Export
  exportBtn:    { height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginTop: 12, marginBottom: 16 },
  exportLabel:  { fontSize: 16 },
});

// ─── Mock data ────────────────────────────────────────────────────────────────
const PERIOD_DATA: Record<Period, {
  received: number; negative: number; avgRating: string; growth: string;
  ratingDist: number[]; activity?: number[]; activityLabels?: string[];
  issue: string; issuePercent: number;
}> = {
  'Today': {
    received: 20, negative: 1, avgRating: '4,5 / 5', growth: '+1,2%',
    ratingDist: [65, 20, 10, 3, 2],
    issue: 'Low Service', issuePercent: 38,
  },
  'This Week': {
    received: 102, negative: 15, avgRating: '4,2 / 5', growth: '+43,2%',
    ratingDist: [60, 22, 10, 5, 3],
    activity: [45, 72, 38, 88, 65, 55, 48],
    activityLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    issue: 'Low Service', issuePercent: 42,
  },
  'This Month': {
    received: 500, negative: 50, avgRating: '4,5 / 5', growth: '+4,2%',
    ratingDist: [65, 20, 10, 3, 2],
    activity: [55, 80, 60, 75],
    activityLabels: ['W1', 'W2', 'W3', 'W4'],
    issue: 'Low Service', issuePercent: 45,
  },
};

const HISTORY_REPORTS = [
  { id:'9', month:'September', year:2024, total:500, negative:50, avgRating:'4,5 / 5', growth:'+4,2%',  isLatest:false,
    ratingDist:[65,20,10,3,2], activity:[55,80,60,75], activityLabels:['W1','W2','W3','W4'], issue:'Low Service', issuePercent:45 },
  { id:'8', month:'August',    year:2024, total:487, negative:43, avgRating:'4,3 / 5', growth:'+2,1%',  isLatest:false,
    ratingDist:[62,22,11,3,2], activity:[50,70,55,65], activityLabels:['W1','W2','W3','W4'], issue:'Wait Times', issuePercent:39 },
  { id:'7', month:'July',      year:2024, total:412, negative:38, avgRating:'4,4 / 5', growth:'+5,8%',  isLatest:false,
    ratingDist:[68,18,9,3,2],  activity:[48,65,52,70], activityLabels:['W1','W2','W3','W4'], issue:'Low Service', issuePercent:36 },
  { id:'6', month:'June',      year:2024, total:389, negative:35, avgRating:'4,2 / 5', growth:'+1,5%',  isLatest:true,
    ratingDist:[60,20,12,5,3], activity:[42,60,48,62], activityLabels:['W1','W2','W3','W4'], issue:'Staff Attitude', issuePercent:41 },
  { id:'5', month:'May',       year:2024, total:356, negative:32, avgRating:'4,1 / 5', growth:'-0,8%',  isLatest:false,
    ratingDist:[58,21,12,6,3], activity:[38,55,45,58], activityLabels:['W1','W2','W3','W4'], issue:'Cleanliness', issuePercent:33 },
];

// ─── Y-axis helper ───────────────────────────────────────────────────
// Calculates 4 evenly-spaced tick values from the data range
function calcTicks(data: number[]): { ticks: number[]; maxTick: number } {
  const maxVal = Math.max(...data, 1);
  const maxTick = Math.max(Math.ceil(maxVal / 20) * 20, 20); // nearest multiple of 20
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
      {/* Y-axis labels — absolute-positioned at each tick height */}
      <View style={{ width: 28, height: trackHeight + 20 }}>
        {ticks.map((tick) => {
          const fromTop = trackHeight - (tick / maxTick) * trackHeight;
          return (
            <Text key={tick} style={[chartStyles.yLbl, { top: fromTop - 6 }]}>{tick}</Text>
          );
        })}
      </View>

      {/* Bars + gridlines area */}
      <View style={{ flex: 1 }}>
        <View style={{ height: trackHeight }}>
          {/* Horizontal gridlines at each tick */}
          {ticks.map((tick) => {
            const fromTop = trackHeight - (tick / maxTick) * trackHeight;
            return (
              <View key={tick}
                style={[chartStyles.grid, { top: fromTop, height: StyleSheet.hairlineWidth }]}
              />
            );
          })}

          {/* Bars */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: trackHeight }}>
            {data.map((val, i) => {
              const fillH = Math.max(Math.round((val / maxTick) * trackHeight), 8);
              return (
                <View key={i} style={{ flex: 1, alignItems: 'center', height: trackHeight, justifyContent: 'flex-end' }}>
                  <View style={{
                    width: barWidth, height: trackHeight,
                    backgroundColor: trackColor, borderRadius: 6,
                    justifyContent: 'flex-end', overflow: 'hidden',
                  }}>
                    <View style={{ width: barWidth, height: fillH, backgroundColor: barColor, borderRadius: 6 }} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* X-axis labels */}
        <View style={{ flexDirection: 'row', marginTop: 6 }}>
          {labels.map((label, i) => (
            <Text key={i} style={[chartStyles.xLbl, { flex: 1 }]}>{label}</Text>
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
      <Circle cx={cx} cy={cx} r={r} stroke="#FFFFFF" strokeWidth={7} fill="none"
        strokeDasharray={`${fill} ${circ - fill}`}
        strokeDashoffset={circ / 4} strokeLinecap="round"
      />
    </Svg>
  );
};

// ─── KPI Card (2×2) ───────────────────────────────────────────────────────────
const KPICard = ({ icon: Icon, iconBg, iconColor = '#FFFFFF', value, label, cardBg, cardW, numColor }: any) => (
  <View style={[kpiStyles.card, { backgroundColor: cardBg, width: cardW }]}>
    <View style={[kpiStyles.circle, { backgroundColor: iconBg }]}>
      <Icon size={26} color={iconColor} strokeWidth={2} />
    </View>
    <AppText weight="bold" style={[kpiStyles.value, { color: numColor }]}>{value}</AppText>
    <AppText style={kpiStyles.label}>{label}</AppText>
  </View>
);

// ─── Issue Card ───────────────────────────────────────────────────────────────
const IssueCard = ({ period, issue, percent }: { period: Period; issue: string; percent: number }) => {
  const labels: Record<Period, string> = {
    'Today': 'ISSUE OF THE DAY', 'This Week': 'ISSUE OF THE WEEK', 'This Month': 'ISSUE OF THE MONTH',
  };
  return (
    <View style={issStyles.card}>
      <View style={{ flex: 1 }}>
        <Text style={issStyles.tag}>{labels[period]}</Text>
        <Text style={issStyles.title}>{issue}</Text>
        <Text style={issStyles.sub}>Mentioned in {percent}% of negative feedbacks</Text>
      </View>
      <MiniDonut percent={percent} />
    </View>
  );
};

// ─── History Report Card ──────────────────────────────────────────────────────
const HistoryCard = ({ item, cardBg, titleColor, onPress }: any) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8}
    style={[histStyles.card, { backgroundColor: cardBg }]}>
    <View style={histStyles.thumb}>
      <BarChart2 size={22} color="#038788" strokeWidth={1.8} />
    </View>
    <View style={{ flex: 1, marginLeft: 14 }}>
      <Text style={[histStyles.month, { color: titleColor }]}>{item.month} {item.year}</Text>
      <Text style={histStyles.count}>{item.total} feedbacks</Text>
    </View>
    {item.isLatest ? (
      <View style={histStyles.badge}><CheckCircle size={16} color="#FFFFFF" strokeWidth={2} /></View>
    ) : (
      <ChevronRight size={18} color="#6B7280" strokeWidth={2} />
    )}
  </TouchableOpacity>
);

// ─── Reports Screen ────────────────────────────────────────────────────────────
export const ReportsScreen = () => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<Nav>();

  const [activeTab, setActiveTab] = useState<Tab>('Latest');
  const [periodIdx, setPeriodIdx] = useState(0);
  const period = PERIODS[periodIdx];
  const data   = PERIOD_DATA[period];

  // Theme tokens
  const cardBg     = isDark ? '#1E2227' : '#F7F7F8';
  const screenBg   = isDark ? colors.dark : colors.white;
  const trackColor = isDark ? '#2A2D31' : '#E5E7EB';
  const titleColor = isDark ? '#FFFFFF' : '#111827';
  const numColor   = isDark ? '#FFFFFF' : '#111827';
  const tabInact   = isDark ? '#1E2227' : '#F3F4F6';
  const barColor   = isDark ? '#42D599' : '#038788';
  const cardW      = (width - 48 - 17) / 2;

  return (
    <View style={[mainStyles.container, { backgroundColor: screenBg }]}>
      <ScrollView
        contentContainerStyle={[mainStyles.scroll, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <AppText weight="bold" style={[mainStyles.title, { color: titleColor }]}>Reports</AppText>

        {/* ── Latest / History switcher ── */}
        <View style={mainStyles.tabRow}>
          {(['Latest', 'History'] as Tab[]).map(t => (
            <TouchableOpacity key={t} onPress={() => setActiveTab(t)} activeOpacity={0.8}
              style={[mainStyles.tabPill, { backgroundColor: activeTab === t ? colors.blue : tabInact }]}>
              <AppText style={[mainStyles.tabLabel, { color: activeTab === t ? '#FFFFFF' : '#9CA3AF' }]}
                weight={activeTab === t ? 'semiBold' : 'regular'}>{t}</AppText>
            </TouchableOpacity>
          ))}
        </View>

        {/* ══ LATEST TAB ══ */}
        {activeTab === 'Latest' && (
          <>
            {/* Period navigator — 40×40 touch zones, size-24 arrows */}
            <View style={mainStyles.periodRow}>
              <TouchableOpacity
                onPress={() => setPeriodIdx(i => Math.max(0, i - 1))}
                disabled={periodIdx === 0}
                style={[mainStyles.arrowBtn, { opacity: periodIdx === 0 ? 0.3 : 1 }]}>
                <ChevronLeft size={24} color={colors.blue} strokeWidth={2.5} />
              </TouchableOpacity>
              <AppText weight="semiBold" style={[mainStyles.periodLabel, { color: titleColor }]}>{period}</AppText>
              <TouchableOpacity
                onPress={() => setPeriodIdx(i => Math.min(PERIODS.length - 1, i + 1))}
                disabled={periodIdx === PERIODS.length - 1}
                style={[mainStyles.arrowBtn, { opacity: periodIdx === PERIODS.length - 1 ? 0.3 : 1 }]}>
                <ChevronRight size={24} color={colors.blue} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* 2×2 KPI Grid */}
            <View style={[mainStyles.kpiGrid, { gap: 17 }]}>
              <View style={mainStyles.kpiRow}>
                <KPICard icon={MessageCircle} iconBg="#22C55E"  value={String(data.received)} label="Feedbacks Received"  cardBg={cardBg} cardW={cardW} numColor={numColor} />
                <KPICard icon={ThumbsDown}    iconBg="#F87171"  value={String(data.negative)} label="Negative Feedbacks"  cardBg={cardBg} cardW={cardW} numColor={numColor} />
              </View>
              <View style={mainStyles.kpiRow}>
                <KPICard icon={Star}       iconBg="#93C5FD"             value={data.avgRating} label="Average Rating"  cardBg={cardBg} cardW={cardW} numColor={numColor} />
                <KPICard icon={TrendingUp} iconBg="#C084FC" iconColor="#1F2937" value={data.growth} label="vs Last month" cardBg={cardBg} cardW={cardW} numColor={numColor} />
              </View>
            </View>

            {/* Rating Distribution — 12px × 157px, bars ordered 1★→5★ (low to high) */}
            <AppText weight="semiBold" style={[mainStyles.sectionTitle, { color: titleColor }]}>Rating Distribution</AppText>
            <View style={[mainStyles.chartCard, { backgroundColor: cardBg }]}>
              <VerticalBarChart
                data={[...data.ratingDist].reverse()}
                labels={['1', '2', '3', '4', '5']}
                barWidth={12} trackHeight={157} barColor={barColor} trackColor={trackColor} />
            </View>

            {/* Feedback Activity — 24px × 170px */}
            {data.activity && data.activityLabels && (
              <>
                <AppText weight="semiBold" style={[mainStyles.sectionTitle, { color: titleColor }]}>Feedback Activity</AppText>
                <View style={[mainStyles.chartCard, { backgroundColor: cardBg }]}>
                  <VerticalBarChart data={data.activity} labels={data.activityLabels}
                    barWidth={24} trackHeight={170} barColor={barColor} trackColor={trackColor} />
                </View>
              </>
            )}

            {/* Issue Card */}
            <IssueCard period={period} issue={data.issue} percent={data.issuePercent} />

            {/* Export Report */}
            <TouchableOpacity style={[mainStyles.exportBtn, { backgroundColor: barColor }]} activeOpacity={0.85}>
              <Text style={[mainStyles.exportLabel, { color: isDark ? '#111827' : '#FFFFFF', fontWeight: '600' }]}>
                Export Report
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* ══ HISTORY TAB ══ */}
        {activeTab === 'History' && (
          <View style={{ marginTop: 4 }}>
            {HISTORY_REPORTS.map(item => (
              <HistoryCard key={item.id} item={item} cardBg={cardBg} titleColor={titleColor}
                onPress={() => navigation.navigate('ReportDetail', {
                  id: item.id, month: item.month, year: item.year,
                  total: item.total, negative: item.negative,
                  avgRating: item.avgRating, growth: item.growth,
                  ratingDist: item.ratingDist, activity: item.activity,
                  activityLabels: item.activityLabels, issue: item.issue,
                  issuePercent: item.issuePercent,
                })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};
