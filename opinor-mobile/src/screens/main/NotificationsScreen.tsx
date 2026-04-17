import React, { useState, useMemo, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, SectionList } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../components/ui/AppText';
import { NotificationItem } from '../../components/notifications/NotificationItem';
import { NotificationEmptyState } from '../../components/notifications/NotificationEmptyState';
import { FilterBottomSheet, FilterOption } from '../../components/notifications/FilterBottomSheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { SlidersHorizontal } from 'lucide-react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getNotifications, NotificationData, GetNotificationsParams } from '../../api/notifications';

export const NotificationsScreen = () => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  
  const [activeFilter, setActiveFilter] = useState<FilterOption>('newest');

  // React Query Infinite Scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ['notifications', activeFilter],
    queryFn: ({ pageParam = 1 }) => {
      const q: GetNotificationsParams = { page: pageParam, limit: 20 };
      if (activeFilter === 'newest') q.sortDir = 'DESC';
      else if (activeFilter === 'older') q.sortDir = 'ASC';
      else if (activeFilter === 'read') { q.sortDir = 'DESC'; q.isRead = true; }
      else if (activeFilter === 'unread') { q.sortDir = 'DESC'; q.isRead = false; }
      return getNotifications(q);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.pagination) return undefined;
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    }
  });

  // Flat accumulation of paginated data
  const flatNotifications = useMemo(() => {
    return data?.pages.flatMap(page => page.notifications) || [];
  }, [data]);

  // Section Grouping Interceptor
  const groupedData = useMemo(() => {
    // Utility to determine if date is "Today", "Yesterday", or returning "DD MMM, YYYY"
    const getGroupLabel = (isoDate: string) => {
      const date = new Date(isoDate);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const isSameDay = (d1: Date, d2: Date) => 
        d1.getDate() === d2.getDate() && 
        d1.getMonth() === d2.getMonth() && 
        d1.getFullYear() === d2.getFullYear();

      if (isSameDay(date, today)) return 'Today';
      if (isSameDay(date, yesterday)) return 'Yesterday';
      
      return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(date);
    };

    const map = new Map<string, NotificationData[]>();
    
    flatNotifications.forEach(n => {
      if (!n || !n.createdAt) return;
      const label = getGroupLabel(n.createdAt);
      if (!map.has(label)) {
        map.set(label, []);
      }
      map.get(label)?.push(n);
    });

    // Convert map to SectionList architecture format
    const sections: { title: string; data: NotificationData[] }[] = [];
    map.forEach((value, key) => {
      sections.push({ title: key, data: value });
    });

    return sections;
  }, [flatNotifications]);

  const getDateGroupLabel = (group: string) => {
    if (group === 'Today') return t('notifications_screen.groups.today');
    if (group === 'Yesterday') return t('notifications_screen.groups.yesterday');
    return group;
  };

  const handleOpenFilters = () => bottomSheetRef.current?.present();
  const handleApplyFilter = (filter: FilterOption) => setActiveFilter(filter);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.dark : colors.white }]}>
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <AppText weight="bold" style={styles.headerTitle}>{t('notifications_screen.title')}</AppText>
      </View>

      {/* Pill Filter Button */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          onPress={handleOpenFilters}
          activeOpacity={0.8}
          style={[
            styles.filterPill, 
            { backgroundColor: isDark ? 'rgba(3, 135, 136, 0.1)' : '#F0F9F9' }
          ]}
        >
          <SlidersHorizontal color="#038788" size={18} style={{ marginRight: 8 }} />
          <AppText weight="bold" style={{ color: '#038788', fontSize: 15 }}>
            {t('notifications_screen.filters')}
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      {isLoading && flatNotifications.length === 0 ? (
        <ActivityIndicator size="large" color="#038788" style={{ marginTop: 100 }} />
      ) : flatNotifications.length === 0 ? (
        <NotificationEmptyState />
      ) : (
        <SectionList
          sections={groupedData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => 
            isFetchingNextPage ? <ActivityIndicator size="small" color="#038788" style={{ padding: 20 }} /> : null
          }
          renderSectionHeader={({ section: { title } }) => (
            <View style={[styles.groupHeaderRow, { backgroundColor: isDark ? colors.dark : colors.white }]}>
              <AppText weight="bold" style={styles.groupTitle}>{getDateGroupLabel(title)}</AppText>
              <View style={[styles.dividerLine, { backgroundColor: '#038788' }]} />
            </View>
          )}
          renderItem={({ item }) => (
            <NotificationItem 
              notification={item} 
              isDark={isDark}
            />
          )}
          stickySectionHeadersEnabled={true}
        />
      )}

      {/* Bottom Sheet */}
      <FilterBottomSheet 
        bottomSheetRef={bottomSheetRef}
        selectedFilter={activeFilter}
        onApply={handleApplyFilter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
  },
  filterContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20, 
  },
  listContent: {
    paddingBottom: 120,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  groupTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#038788', 
  },
  dividerLine: {
    flex: 1,
    height: 0.8,
    opacity: 0.2,
  },
});
