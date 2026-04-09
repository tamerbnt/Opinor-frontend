import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View, StyleSheet, FlatList, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../components/ui/AppText';
import { useTheme } from '../../theme/ThemeContext';
import { Star, Smile, Frown, Meh, SlidersHorizontal, Circle, CheckCircle2 } from 'lucide-react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';

import { SwipeableDeck, Feedback } from '../../components/ui/SwipeableDeck';
import { Colors } from '../../constants/Theme';

// ─── Mock data ────────────────────────────────────────────────────────────────
const DUMMY_FEEDBACKS: Feedback[] = [
  {
    id: '1',
    customerName: 'Alice',
    initials: 'AL',
    rating: 4,
    comment: 'The overall experience was really good. The only reason I didn\'t give five stars is because my order took a bit longer than expected, but everything else was great. I\'ll definitely come again.',
    date: 'Oct 11, 14:30',
  },
  {
    id: '2',
    customerName: 'Bob',
    initials: 'BO',
    rating: 2,
    comment: 'I was disappointed with my visit today. The staff seemed overwhelmed, and it took more than 20 minutes to get my order. When it finally arrived, the drink wasn\'t prepared the way I asked.',
    date: 'Oct 11, 13:30',
  },
  {
    id: '3',
    customerName: 'Charlie',
    initials: 'CH',
    rating: 3,
    comment: 'The experience was okay overall. The place was clean and the staff were polite, but nothing really stood out. The service could be a bit faster, and the prices feel slightly high for what you get.',
    date: 'Oct 11, 11:30',
  },
];

type SortOption = 'newest' | 'older' | 'read' | 'unread';

// ─── Star Row ─────────────────────────────────────────────────────────────────
const StarRow = ({ rating }: { rating: number }) => (
  <View style={styles.starRow}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={16}
        color="#ECD908"
        fill={i < rating ? '#ECD908' : 'transparent'}
        strokeWidth={1.5}
      />
    ))}
  </View>
);

// ─── Feedback Card (List View) ────────────────────────────────────────────────
const FeedbackCard = ({ item, isDark, colors }: { item: Feedback; isDark: boolean; colors: any }) => {
  const getSentimentIcon = (r: number) => {
    if (r >= 4) return <Smile size={16} color={colors.green} strokeWidth={2} />;
    if (r === 3) return <Meh size={16} color="#ECD908" strokeWidth={2} />;
    return <Frown size={16} color={colors.brique} strokeWidth={2} />;
  };

  return (
    <View style={[styles.card, { 
      backgroundColor: colors.sombreCards,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0 : 0.05,
      shadowRadius: 8,
      elevation: isDark ? 0 : 3,
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? '#2A2A2A' : 'transparent',
    }]}>
      {/* Top row: Status + Time */}
      <View style={styles.cardHeader}>
        <View style={styles.sentimentInfo}>
          {getSentimentIcon(item.rating)}
          <AppText style={[styles.dateText, { color: '#888888' }]}>{item.date}</AppText>
        </View>
      </View>

      {/* Body */}
      <AppText style={[styles.commentText, { color: colors.dark }]} numberOfLines={4}>
        {item.comment}
      </AppText>

      {/* Footer: Stars */}
      <StarRow rating={item.rating} />
    </View>
  );
};

// ─── Feedbacks Screen ─────────────────────────────────────────────────────────
export const FeedbacksScreen = () => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [isDeckView, setIsDeckView] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ['45%'], []);

  const handleOpenFilters = () => {
    setIsDeckView(false);
    bottomSheetRef.current?.expand();
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  const displayCountText = `${DUMMY_FEEDBACKS.length} received today`;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.dark : Colors.light.white }]}>
      
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <AppText weight="semiBold" style={[styles.screenTitle, { color: colors.dark }]}>
          Feedbacks
        </AppText>
        
        {isDeckView && (
          <TouchableOpacity 
            style={[styles.pillFilterButton, { borderColor: isDark ? 'rgba(46,204,113,0.3)' : 'rgba(46,204,113,0.5)' }]}
            onPress={handleOpenFilters}
            activeOpacity={0.7}
          >
            <SlidersHorizontal size={14} color={colors.blue} style={{ marginRight: 6 }} />
            <AppText weight="semiBold" style={{ color: colors.blue, fontSize: 13 }}>Filters</AppText>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Content Toggle ── */}
      {isDeckView ? (
        <View style={styles.deckWrapper}>
          <SwipeableDeck data={DUMMY_FEEDBACKS} isDark={isDark} />
          <AppText weight="semiBold" style={[styles.countTextCentered, { color: colors.dark }]}>
            {displayCountText}
          </AppText>
          {/* We skip the hand drawn SVG line per instructions */}
        </View>
      ) : (
        <>
          <View style={styles.listHeaderRow}>
            <AppText weight="semiBold" style={[styles.countTextLeft, { color: colors.dark }]}>
              {displayCountText}
            </AppText>
            <TouchableOpacity onPress={handleOpenFilters} style={styles.iconFilterBtn}>
              <SlidersHorizontal size={18} color={colors.blue} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={DUMMY_FEEDBACKS}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <FeedbackCard item={item} isDark={isDark} colors={colors} />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {/* ── Sort Bottom Sheet ── */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: isDark ? '#1A1D21' : '#FFFFFF', borderRadius: 24 }}
        handleIndicatorStyle={{ backgroundColor: '#888', width: 40, height: 4 }}
      >
        <View style={styles.sheetContent}>
          <AppText weight="semiBold" style={[styles.sheetTitle, { color: colors.dark }]}>Sort By</AppText>

          {/* Radio items */}
          {(['newest', 'older', 'read', 'unread'] as SortOption[]).map((option) => {
            const labelMap: Record<SortOption, string> = {
              newest: 'Newest First',
              older: 'Older First',
              read: 'Read Notification',
              unread: 'Unread Notification',
            };
            const isActive = sortBy === option;
            return (
              <TouchableOpacity 
                key={option} 
                style={styles.radioRow} 
                onPress={() => setSortBy(option)}
                activeOpacity={0.8}
              >
                <AppText style={{ color: colors.dark, fontSize: 16 }}>{labelMap[option]}</AppText>
                {isActive ? (
                  <CheckCircle2 color={colors.blue} size={22} fill={isDark ? 'rgba(3,135,136,0.2)' : 'rgba(46,204,113,0.1)'} />
                ) : (
                  <Circle color="#9CA3AF" size={22} />
                )}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity 
            style={[styles.applyBtn, { backgroundColor: colors.blue }]}
            onPress={() => bottomSheetRef.current?.close()}
            activeOpacity={0.8}
          >
            <AppText weight="semiBold" style={{ color: '#FFFFFF', fontSize: 16 }}>Apply</AppText>
          </TouchableOpacity>
        </View>
      </BottomSheet>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Header */
  header: {
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 10,
  },
  screenTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  pillFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },

  /* Deck State */
  deckWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  countTextCentered: {
    fontSize: 16,
    marginTop: 10,
  },

  /* List State */
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
    marginTop: 10,
  },
  countTextLeft: {
    fontSize: 16,
  },
  iconFilterBtn: {
    padding: 6,
    borderRadius: 8,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },

  /* Feedback card */
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sentimentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  starRow: {
    flexDirection: 'row',
    gap: 4,
  },

  /* Bottom Sheet */
  sheetContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  sheetTitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  applyBtn: {
    marginTop: 24,
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
