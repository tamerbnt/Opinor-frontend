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
import { Star, Smile, Frown, Meh, ArrowRight, ArrowLeft, Settings } from 'lucide-react-native';
import { Colors } from '../../constants/Theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

import { FeedbackData as Feedback } from '../../api/feedbacks';

interface SwipeableDeckProps {
  data: Feedback[];
  isDark: boolean;
  onDeckEmpty?: () => void;
  onCardPress?: (card: Feedback) => void;
  onCardSwiped?: (card: Feedback) => void;
}

export const SwipeableDeck: React.FC<SwipeableDeckProps> = ({ 
  data, 
  isDark, 
  onDeckEmpty,
  onCardPress,
  onCardSwiped
}) => {
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
    
    // Trigger optimistic update callback
    const swipedCard = data[currentIndex];
    if (swipedCard && onCardSwiped) {
      onCardSwiped(swipedCard);
    }
    
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    if (nextIndex >= data.length && onDeckEmpty) {
      onDeckEmpty();
    }
  };

  const handleNextPress = () => forceSwipe('left');
  
  const getSentimentIcon = (rating: number) => {
    if (rating >= 4) return <Smile size={20} color={themeColors.blue} strokeWidth={1.5} />;
    if (rating === 3) return <Meh size={20} color="#ECD908" strokeWidth={1.5} />;
    return <Frown size={20} color={themeColors.brique} strokeWidth={1.5} />;
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
      const scale = isTop ? 1 : 0.94 - (depthOffset * 0.04);

      // Create a slight fan effect: Card 1 tilts slightly left, Card 2 slightly right.
      // Top card moves freely with `position`
      let rotate = '0deg';
      let translateY = 0;
      let translateX = 0;

      if (!isTop) {
        if (depthOffset === 1) {
          rotate = '-6deg';
          translateX = -10;
          translateY = -20;
        } else if (depthOffset === 2) {
          rotate = '6deg';
          translateX = 10;
          translateY = -40;
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
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={() => onCardPress?.(item)}
              style={{ flex: 1 }}
            >
              {renderCardContent(item, isDark, themeColors, getSentimentIcon, handleNextPress)}
            </TouchableOpacity>
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
          <View 
            style={[
              StyleSheet.absoluteFillObject, 
              { 
                backgroundColor: isDark ? '#000' : '#FFF', 
                opacity: depthOffset * 0.15,
                borderRadius: 24
              }
            ]} 
            pointerEvents="none" 
          />
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
      shadowOffset: { width: 0, height: 15 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: 30,
      elevation: isDark ? 0 : 8,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
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
  const textColor = colors.text;
  
  return (
    <View style={styles.innerContent}>
      {/* Top Left Rating */}
      <View style={styles.ratingInfo}>
        <AppText weight="bold" style={[styles.ratingText, { color: colors.blue }]}>
          {item.rating}
        </AppText>
        <Star size={14} color={colors.blue} strokeWidth={2} />
      </View>

      {/* Main Comment */}
      <AppText style={[styles.commentText, { color: textColor }]} numberOfLines={6}>
        "{item.text}"
      </AppText>

      {/* Navigation Arrows Row (Above the line) */}
      <View style={styles.actionRow}>
        {onNext && (
          <View style={styles.arrowsRow}>
            <TouchableOpacity onPress={() => {}} activeOpacity={0.7}>
              <ArrowRight size={20} color={colors.blue} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onNext} activeOpacity={0.7} style={{ marginLeft: -4 }}>
              <ArrowRight size={20} color={colors.blue} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Separator Line */}
      <View style={[styles.separator, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />

      {/* Bottom Footer Row */}
      <View style={styles.bottomRow}>
        <View style={styles.sentimentInfo}>
          <View style={[styles.iconCircle, { borderColor: colors.blue, opacity: 0.8 }]}>
            {getIcon(item.rating)}
          </View>
          <AppText variant="caption" style={[styles.dateText, { color: colors.textSecondary }]}>
            {item.date}
          </AppText>
        </View>
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
  ratingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 24,
    gap: 4
  },
  ratingText: {
    fontSize: 18,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 24,
    fontStyle: 'italic',
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  separator: {
    height: 1,
    width: '100%',
    marginBottom: 16,
    opacity: 0.5,
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
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
