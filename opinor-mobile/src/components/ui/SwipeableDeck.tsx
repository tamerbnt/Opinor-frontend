import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { AppText } from './AppText';
import { Star, Smile, Frown, Meh, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { Colors } from '../../constants/Theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

export interface Feedback {
  id: string;
  customerName: string;
  initials: string;
  rating: number;
  comment: string;
  date: string;
}

interface SwipeableDeckProps {
  data: Feedback[];
  isDark: boolean;
  onDeckEmpty?: () => void;
}

export const SwipeableDeck: React.FC<SwipeableDeckProps> = ({ data, isDark, onDeckEmpty }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;
  const themeColors = isDark ? Colors.dark : Colors.light;

  // Reset when data changes entirely
  useEffect(() => {
    setCurrentIndex(0);
  }, [data]);

  const pRes = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      }
    })
  ).current;

  const forceSwipe = (direction: 'left' | 'right') => {
    const x = direction === 'right' ? SCREEN_WIDTH + 50 : -SCREEN_WIDTH - 50;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false
    }).start(() => onSwipeComplete());
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false
    }).start();
  };

  const onSwipeComplete = () => {
    position.setValue({ x: 0, y: 0 });
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    if (nextIndex >= data.length && onDeckEmpty) {
      onDeckEmpty();
    }
  };

  const handleNextPress = () => forceSwipe('left');
  
  const getSentimentIcon = (rating: number) => {
    if (rating >= 4) return <Smile size={20} color={themeColors.green} strokeWidth={2} />;
    if (rating === 3) return <Meh size={20} color="#ECD908" strokeWidth={2} />;
    return <Frown size={20} color={themeColors.brique} strokeWidth={2} />;
  };

  const renderCards = () => {
    if (currentIndex >= data.length) {
      return (
        <View style={styles.emptyContainer}>
          <AppText style={{ color: themeColors.dark }}>No more feedbacks today.</AppText>
        </View>
      );
    }

    return data.map((item, i) => {
      if (i < currentIndex) return null; // Already swiped
      if (i > currentIndex + 2) return null; // Don't render more than 3 cards

      const isTop = i === currentIndex;
      
      // Calculate depth properties
      const depthOffset = i - currentIndex;
      
      // Fan layout settings
      // Back cards scale down slightly and rotate outwards
      const scale = isTop ? 1 : 0.95 - (depthOffset * 0.05);

      // Create a slight fan effect: Card 1 tilts slightly left, Card 2 slightly right.
      // Top card moves freely with `position`
      let rotate = '0deg';
      let translateY = 0;
      let translateX = 0;

      if (!isTop) {
         if (depthOffset === 1) {
           rotate = '-3deg';
           translateX = -10;
           translateY = -15;
         } else if (depthOffset === 2) {
           rotate = '3deg';
           translateX = 10;
           translateY = -25;
         }
      }

      if (isTop) {
        return (
          <Animated.View
            key={item.id}
            style={[
              getCardStyle(isDark, themeColors, scale, translateY, translateX, rotate),
              {
                zIndex: 99,
                transform: [
                  { translateX: position.x },
                  { translateY: position.y },
                  { rotate: position.x.interpolate({ inputRange: [-SCREEN_WIDTH * 2, SCREEN_WIDTH * 2], outputRange: ['-60deg', '60deg'] }) },
                  { scale }
                ],
              }
            ]}
            {...pRes.panHandlers}
          >
            {renderCardContent(item, isDark, themeColors, getSentimentIcon, handleNextPress)}
          </Animated.View>
        );
      }

      // Background cards
      return (
        <Animated.View
          key={item.id}
          style={[
            getCardStyle(isDark, themeColors, scale, translateY, translateX, rotate),
            { zIndex: 99 - depthOffset }
          ]}
        >
          {/* Faded overlay for depth */}
          <View style={StyleSheet.absoluteFillObject} pointerEvents="none" />
          {renderCardContent(item, isDark, themeColors, getSentimentIcon, undefined)}
        </Animated.View>
      );
    }).reverse();
  };

  return (
    <View style={styles.deckContainer}>
      {renderCards()}
    </View>
  );
};

// Extracted styles generator
const getCardStyle = (
  isDark: boolean, 
  colors: any, 
  scale: number, 
  ty: number, 
  tx: number,
  rot: string
) => {
  return [
    styles.cardContainer,
    {
      backgroundColor: colors.sombreCards,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0 : 0.08,
      shadowRadius: 10,
      elevation: isDark ? 0 : 5,
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? '#2A2A2A' : 'transparent',
      transform: [
        { scale },
        { translateY: ty },
        { translateX: tx },
        { rotate: rot }
      ]
    }
  ];
};

const renderCardContent = (
  item: Feedback, 
  isDark: boolean, 
  colors: any, 
  getIcon: any,
  onNext?: () => void
) => {
  const textColor = colors.dark;
  
  return (
    <View style={styles.innerContent}>
      {/* Top Left Rating Badge */}
      <View style={[styles.ratingBadge, { backgroundColor: colors.blue }]}>
        <AppText weight="bold" style={styles.badgeText}>{item.rating}</AppText>
        <Star size={12} color="#FFFFFF" fill="#FFFFFF" />
      </View>

      {/* Main Comment */}
      <AppText style={[styles.commentText, { color: textColor }]} numberOfLines={6}>
        "{item.comment}"
      </AppText>

      {/* Bottom Row */}
      <View style={styles.bottomRow}>
        <View style={styles.sentimentInfo}>
          {getIcon(item.rating)}
          <AppText style={[styles.dateText, { color: '#888888' }]}>{item.date}</AppText>
        </View>

        {/* Navigation Arrows (only on front card if onNext provided) */}
        {onNext && (
          <View style={styles.arrowsRow}>
            <TouchableOpacity onPress={() => {}} activeOpacity={0.7} style={{ marginRight: -4, opacity: 0.4 }}>
              <ArrowLeft size={18} color={textColor} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onNext} activeOpacity={0.7}>
              <ArrowRight size={18} color={colors.blue} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  deckContainer: {
    height: 300,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  cardContainer: {
    padding: 24,
    borderRadius: 24,
    position: 'absolute',
    width: SCREEN_WIDTH - 48,
    minHeight: 220,
    justifyContent: 'space-between'
  },
  innerContent: {
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 4
  },
  badgeText: {
    color: '#FFF',
    fontSize: 14,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
    marginBottom: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sentimentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 12,
  },
  arrowsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
