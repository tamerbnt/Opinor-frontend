import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../components/ui/AppText';
import { useTheme } from '../../theme/ThemeContext';
import { Star, Smile, Frown, Meh, SlidersHorizontal, Circle, CheckCircle2, ChevronLeft } from 'lucide-react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { SwipeableDeck } from '../../components/ui/SwipeableDeck';
import { useUIStore } from '../../store/UIStore';
import { getFeedbacks, updateFeedbackStatus, FeedbackData, GetFeedbacksParams } from '../../api/feedbacks';

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
const FeedbackCard = ({ item, isDark, colors }: { item: FeedbackData; isDark: boolean; colors: any }) => {
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
      opacity: item.status === 'viewed' || item.status === 'responded' ? 0.7 : 1, // Visually dim read items
    }]}>
      {/* Top row: Status + Time */}
      <View style={styles.cardHeader}>
        <View style={styles.sentimentInfo}>
          {getSentimentIcon(item.rating)}
          <AppText variant="caption" style={[styles.dateText, { color: colors.textSecondary }]}>{item.date}</AppText>
        </View>
      </View>

      {/* Body */}
      <AppText style={styles.commentText} numberOfLines={4}>
        "{item.text}"
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
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const [isDeckView, setIsDeckView] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  const { setTabBarHidden } = useUIStore();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['45%'], []);

  const handleSheetChange = useCallback((index: number) => {
    setTabBarHidden(index >= 0);
  }, [setTabBarHidden]);

  // --- API DATA BINDINGS ---
  
  // 1. Unread Deck Query (Clamped limiting)
  const { data: deckData, isLoading: isDeckLoading } = useQuery({
    queryKey: ['unreadFeedbacks'],
    queryFn: () => getFeedbacks({ status: 'new', limit: 15 }),
    enabled: isDeckView,
  });

  const unreadFeedbacks = deckData?.feedbacks || [];

  // 2. Infinite List Query
  const {
    data: listData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isListLoading
  } = useInfiniteQuery({
    queryKey: ['feedbacksList', sortBy],
    queryFn: ({ pageParam = 1 }) => {
      const q: GetFeedbacksParams = { page: pageParam, limit: 15 };
      if (sortBy === 'newest') q.sortDir = 'DESC';
      if (sortBy === 'older') q.sortDir = 'ASC';
      if (sortBy === 'read') q.status = 'viewed,responded';
      if (sortBy === 'unread') q.status = 'new';
      return getFeedbacks(q);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.pagination) return undefined;
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    }
  });

  const flatListFeedbacks = useMemo(() => {
    return listData?.pages.flatMap(page => page.feedbacks) || [];
  }, [listData]);

  // 3. Optimistic Swipe Mutation
  const markReadMutation = useMutation({
    mutationFn: (id: string) => updateFeedbackStatus(id, 'viewed'),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['unreadFeedbacks'] });
      const previousDeck = queryClient.getQueryData<any>(['unreadFeedbacks']);
      
      // Optimistically eject the card from cache immediately
      if (previousDeck) {
        queryClient.setQueryData(['unreadFeedbacks'], {
          ...previousDeck,
          feedbacks: previousDeck.feedbacks.filter((f: any) => f.id !== id)
        });
      }
      return { previousDeck };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['unreadFeedbacks'], context?.previousDeck);
    },
    onSettled: () => {
      // Invalidate both quietly in background to ensure sync
      queryClient.invalidateQueries({ queryKey: ['unreadFeedbacks'] });
      queryClient.invalidateQueries({ queryKey: ['feedbacksList'] });
    }
  });

  // --- ACTIONS ---
  
  const handleDeckCardSwiped = (card: FeedbackData) => {
    markReadMutation.mutate(card.id);
  };

  const handleOpenFilters = () => {
    bottomSheetRef.current?.expand();
  };

  const totalFeedbacksCount = listData?.pages[0]?.pagination?.total || flatListFeedbacks.length;
  const displayCountText = t('feedbacks.count_received', { count: totalFeedbacksCount });

  // --- RENDER ---
  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.dark : colors.white }]}>
      
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerTopRow}>
          {isDeckView ? (
            <View style={{ width: 44 }} />
          ) : (
            <TouchableOpacity 
              onPress={() => setIsDeckView(true)} 
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <View style={[styles.backCircle, { backgroundColor: isDark ? '#2A2A2A' : '#F1F5F9' }]} />
              <ChevronLeft size={22} color={colors.blue} style={styles.backIcon} />
            </TouchableOpacity>
          )}
          <AppText weight="bold" style={styles.screenTitle}>
            {t('feedbacks.title')}
          </AppText>
          <View style={{ width: 44 }} />
        </View>
        
        {isDeckView && (
          <TouchableOpacity 
            style={[styles.pillFilterButton, { backgroundColor: isDark ? 'rgba(3, 135, 136, 0.1)' : '#F1F5F9' }]}
            onPress={handleOpenFilters}
            activeOpacity={0.7}
          >
            <SlidersHorizontal size={14} color={colors.blue} style={{ marginRight: 6 }} strokeWidth={2.5} />
            <AppText weight="semiBold" style={{ color: colors.blue, fontSize: 13 }}>{t('feedbacks.filters')}</AppText>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Content Toggle ── */}
      {isDeckView ? (
        <View style={styles.deckWrapper}>
          {isDeckLoading && unreadFeedbacks.length === 0 ? (
            <ActivityIndicator size="large" color={colors.blue} style={{ marginTop: 100 }} />
          ) : (
            <>
              <SwipeableDeck 
                data={unreadFeedbacks} 
                isDark={isDark} 
                onCardPress={() => setIsDeckView(false)}
                onCardSwiped={handleDeckCardSwiped}
                onDeckEmpty={() => setIsDeckView(false)}
              />
              <View style={styles.countWrapper}>
                <AppText weight="bold" style={styles.countNumber}>
                  {unreadFeedbacks.length}{' '}
                </AppText>
                <AppText variant="muted" style={styles.countLabel}>
                  {t('feedbacks.received_today')}
                </AppText>
              </View>
            </>
          )}
        </View>
      ) : (
        <>
          <View style={styles.listHeaderRow}>
            <AppText weight="bold" style={styles.countTextLeft}>
              {displayCountText}
            </AppText>
            <TouchableOpacity onPress={handleOpenFilters} style={styles.iconFilterBtn}>
              <SlidersHorizontal size={18} color={colors.blue} />
            </TouchableOpacity>
          </View>
          
          {isListLoading && flatListFeedbacks.length === 0 ? (
            <ActivityIndicator size="large" color={colors.blue} style={{ marginTop: 50 }} />
          ) : (
            <FlatList
              data={flatListFeedbacks}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <FeedbackCard item={item} isDark={isDark} colors={colors} />
              )}
              onEndReached={() => {
                if (hasNextPage) fetchNextPage();
              }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isFetchingNextPage ? <ActivityIndicator size="small" color={colors.blue} style={{ padding: 20 }} /> : null
              }
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}

      {/* ── Sort Bottom Sheet ── */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChange}
        backdropComponent={(props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: isDark ? '#1A1D21' : '#FFFFFF', borderRadius: 24 }}
        handleIndicatorStyle={{ backgroundColor: '#888', width: 40, height: 4 }}
      >
        <View style={styles.sheetContent}>
          <AppText weight="semiBold" style={[styles.sheetTitle, { color: colors.dark }]}>{t('feedbacks.sort_by')}</AppText>

          {/* Radio items */}
          {(['newest', 'older', 'read', 'unread'] as SortOption[]).map((option) => {
            const labelMap: Record<SortOption, string> = {
              newest: t('feedbacks.sort_options.newest'),
              older: t('feedbacks.sort_options.older'),
              read: t('feedbacks.sort_options.read'),
              unread: t('feedbacks.sort_options.unread'),
            };
            const isActive = sortBy === option;
            return (
              <TouchableOpacity 
                key={option} 
                style={styles.radioRow} 
                onPress={() => {
                  setSortBy(option);
                  setIsDeckView(false); // Move to list view to respect filter
                  bottomSheetRef.current?.close();
                }}
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
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  screenTitle: {
    fontSize: 22,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent', // Added transparent border safety
  },

  /* Deck State */
  deckWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  countWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  countNumber: {
    fontSize: 16,
  },
  countLabel: {
    fontSize: 16,
    opacity: 0.7,
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
    fontStyle: 'italic',
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
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    position: 'absolute',
  },
  backIcon: {
    zIndex: 1,
  }
});
