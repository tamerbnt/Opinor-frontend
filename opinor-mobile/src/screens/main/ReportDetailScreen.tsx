import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MessageCircle, ThumbsDown, Star, TrendingUp, ChevronLeft } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { AppText } from '../../components/ui/AppText';
import { useTheme } from '../../theme/ThemeContext';
import { ReportsStackParamList } from '../../navigation/ReportsNavigator';

type Props = NativeStackScreenProps<ReportsStackParamList, 'ReportDetail'>;

// ALL StyleSheets defined before any component to prevent TDZ issues
const chartStyles = StyleSheet.create({
  xLbl:  { fontSize: 10, color: '#9CA3AF', textAlign: 'center', marginTop: 6 },
  yLbl:  { fontSize: 9,  color: '#9CA3AF', textAlign: 'right', position: 'absolute', right: 4 },
  grid:  { position: 'absolute', left: 0, right: 0, backgroundColor: 'rgba(150,150,150,0.18)' },
});

// Y-axis tick calculator (shared logic)
function calcTicks(data: number[]): { ticks: number[]; maxTick: number } {
  const maxVal = Math.max(...data, 1);
  const maxTick = Math.max(Math.ceil(maxVal / 20) * 20, 20);
  const step = maxTick / 4;
  return { ticks: [step, step * 2, step * 3, step * 4], maxTick };
}

// ─── Vertical Bar Chart with Y-axis ──────────────────────────────────────────
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
      {/* Y-axis labels */}
      <View style={{ width: 28, height: trackHeight + 20 }}>
        {ticks.map((tick) => {
          const fromTop = trackHeight - (tick / maxTick) * trackHeight;
          return (
            <Text key={tick} style={[chartStyles.yLbl, { top: fromTop - 6 }]}>{tick}</Text>
          );
        })}
      </View>

      {/* Bars + gridlines */}
      <View style={{ flex: 1 }}>
        <View style={{ height: trackHeight }}>
          {ticks.map((tick) => {
            const fromTop = trackHeight - (tick / maxTick) * trackHeight;
            return (
              <View key={tick}
                style={[chartStyles.grid, { top: fromTop, height: StyleSheet.hairlineWidth }]}
              />
            );
          })}
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
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
      />
    </Svg>
  );
};

// StyleSheets for KPIBadge and main screen
const badge = StyleSheet.create({
  card:   { flex: 1, borderRadius: 10, padding: 12, alignItems: 'center' },
  circle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  value:  { fontSize: 13, marginBottom: 4, textAlign: 'center' },
  label:  { fontSize: 9, color: '#9CA3AF', textAlign: 'center', lineHeight: 12 },
});

const s = StyleSheet.create({
  container:    { flex: 1 },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  backBtn:      { width: 40, height: 40, justifyContent: 'center' },
  headerTitle:  { fontSize: 18, textAlign: 'center' },
  badgeRow:     { flexDirection: 'row', gap: 8, marginBottom: 24 },
  sectionTitle: { fontSize: 15, marginBottom: 14 },
  chartCard:    { borderRadius: 10, padding: 17, marginBottom: 24 },
  issueCard:    { backgroundColor: '#FECACA', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  issueTag:     { fontSize: 10, fontWeight: '700', color: '#B91C1C', letterSpacing: 0.8, marginBottom: 6 },
  issueTitle:   { fontSize: 16, color: '#1F2937', marginBottom: 4 },
  issueSub:     { fontSize: 12, color: '#6B7280', lineHeight: 16 },
  exportBtn:    { height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  exportLabel:  { fontSize: 16 },
});

// ─── Compact 1×4 KPI Badge (Detail screen) ───────────────────────────────────
const KPIBadge = ({
  icon: Icon, iconBg, iconColor = '#FFFFFF',
  value, label, cardBg, numColor,
}: any) => (
  <View style={[badge.card, { backgroundColor: cardBg }]}>
    <View style={[badge.circle, { backgroundColor: iconBg }]}>
      <Icon size={16} color={iconColor} strokeWidth={2} />
    </View>
    <AppText weight="bold" style={[badge.value, { color: numColor }]}>{value}</AppText>
    <AppText style={badge.label}>{label}</AppText>
  </View>
);

// ─── Report Detail Screen ─────────────────────────────────────────────────────
export const ReportDetailScreen = ({ route, navigation }: Props) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const report = route.params;

  const cardBg     = isDark ? '#1E2227' : '#F7F7F8';
  const screenBg   = isDark ? colors.dark : colors.white;
  const trackColor = isDark ? '#2A2D31' : '#E5E7EB';
  const titleColor = isDark ? '#FFFFFF' : '#111827';
  const numColor   = isDark ? '#FFFFFF' : '#111827';
  const barColor   = isDark ? '#42D599' : '#038788';

  // Translate month if possible
  const monthKey = report.month.toLowerCase();
  const translatedMonth = t(`months.${monthKey}`, { defaultValue: report.month });

  return (
    <View style={[s.container, { backgroundColor: screenBg }]}>

      {/* ── Header ── */}
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={24} color={colors.blue} strokeWidth={2.5} />
        </TouchableOpacity>
        <AppText weight="bold" style={[s.headerTitle, { color: titleColor }]}>
          {translatedMonth} {t('reports.title')}
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[s.badgeRow]}>
          <KPIBadge icon={MessageCircle} iconBg="#22C55E"
            value={String(report.total)} label={t('reports.kpis.received').replace(' ', '\n')}
            cardBg={cardBg} numColor={numColor} />
          <KPIBadge icon={ThumbsDown} iconBg="#F87171"
            value={String(report.negative)} label={t('reports.kpis.negative').replace(' ', '\n')}
            cardBg={cardBg} numColor={numColor} />
          <KPIBadge icon={Star} iconBg="#93C5FD"
            value={report.avgRating} label={t('reports.kpis.avg_rating').replace(' ', '\n')}
            cardBg={cardBg} numColor={numColor} />
          <KPIBadge icon={TrendingUp} iconBg="#C084FC" iconColor="#1F2937"
            value={report.growth} label={t('reports.kpis.growth').replace('vs Last ', 'vs\n')}
            cardBg={cardBg} numColor={numColor} />
        </View>

        <AppText weight="semiBold" style={[s.sectionTitle, { color: titleColor }]}>
          {t('reports.charts.rating_dist')}
        </AppText>
        <View style={[s.chartCard, { backgroundColor: cardBg }]}>
          <VerticalBarChart
            data={[...report.ratingDist].reverse()}
            labels={['1', '2', '3', '4', '5']}
            barWidth={12}
            trackHeight={157}
            barColor={barColor}
            trackColor={trackColor}
          />
        </View>

        <AppText weight="semiBold" style={[s.sectionTitle, { color: titleColor }]}>
          {t('reports.charts.feedback_activity')}
        </AppText>
        <View style={[s.chartCard, { backgroundColor: cardBg }]}>
          <VerticalBarChart
            data={report.activity}
            labels={report.activityLabels}
            barWidth={24}
            trackHeight={170}
            barColor={barColor}
            trackColor={trackColor}
          />
        </View>

        <View style={s.issueCard}>
          <View style={{ flex: 1 }}>
            <AppText style={s.issueTag}>{t('reports.issues.tags.month')}</AppText>
            <AppText weight="bold" style={s.issueTitle}>{report.issue}</AppText>
            <AppText style={s.issueSub}>
              {t('reports.issues.mentioned_in', { percent: report.issuePercent })}
            </AppText>
          </View>
          <MiniDonut percent={report.issuePercent} />
        </View>

        <TouchableOpacity style={[s.exportBtn, { backgroundColor: barColor }]} activeOpacity={0.85}>
          <AppText weight="semiBold" style={[s.exportLabel, { color: isDark ? '#111827' : '#FFFFFF' }]}>
            {t('reports.actions.export')}
          </AppText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
