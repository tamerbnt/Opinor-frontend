import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  Text,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Home, BarChart2, MessageCircle, Bell, User } from 'lucide-react-native';
import { Animated } from 'react-native';
import { useUIStore } from '../../store/UIStore';

const { width } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────
// Layout constants derived from Figma spec + Union.png geometry
// ─────────────────────────────────────────────────────────────
// Figma bar body height (Rectangle 372): 68.34dp
const BAR_BODY_HEIGHT = 68;
const ARCH_PROTRUSION  = 30;

// Figma tab item spec: fixed 63.79dp wide
const TAB_ITEM_WIDTH    = 64;
// Figma padding per item: 11.39dp top/bottom, 13.67dp left/right
const TAB_ITEM_PAD_V    = 11;
const TAB_ITEM_PAD_H    = 14;
// Figma icon→label gap: 4.56dp
const TAB_ITEM_GAP      = 5;

const ROUTES: { name: string; labelKey: string }[] = [
  { name: 'Home',          labelKey: 'tabs.home'          },
  { name: 'Reports',       labelKey: 'tabs.reports'       },
  { name: 'Feedbacks',     labelKey: 'tabs.feedbacks'     },
  { name: 'Notifications', labelKey: 'tabs.notifications' },
  { name: 'Profile',       labelKey: 'tabs.profile'       },
];

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const iconMap: Record<string, React.ComponentType<any>> = {
    Home:          Home,
    Reports:       BarChart2,
    Feedbacks:     MessageCircle,
    Notifications: Bell,
    Profile:       User,
  };

  // Dynamic height calculation including safe area
  const totalBarHeight = BAR_BODY_HEIGHT + insets.bottom;
  const totalContainerHeight = totalBarHeight + ARCH_PROTRUSION;

  const { isTabBarHidden } = useUIStore();
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isTabBarHidden ? totalContainerHeight : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [isTabBarHidden, totalContainerHeight, slideAnim]);

  // In dark mode tint the Union.png to the dark surface colour.
  const unionTint = isDark ? '#1A1D21' : undefined;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          height: totalContainerHeight,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >

      {/* ── Union.png: full bar background + arch bump ── */}
      <Image
        source={require('../../../assets/Union.png')}
        style={[
          styles.unionImage,
          { height: totalContainerHeight },
          unionTint ? { tintColor: unionTint } : undefined,
        ]}
        resizeMode="stretch"
      />

      {/* ── FAB centre button — lives in the arch protrusion zone ── */}
      {state.routes.map((route, index) => {
        if (route.name !== 'Feedbacks') return null;
        const isFocused = state.index === index;
        const config    = ROUTES.find(r => r.name === route.name);
        const label     = t(config?.labelKey || '');
        const color     = isFocused ? colors.blue : '#9CA3AF';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <View key={route.key} style={[styles.centerOuter, { height: totalContainerHeight, paddingBottom: insets.bottom + 24 }]}>
            {/* Layered atmospheric glow - Aura + Core */}
            <View style={styles.glowAura}>
              <View style={styles.glowCore}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={onPress}
                  style={[styles.centerBtn, { backgroundColor: colors.blue }]}
                >
                  <MessageCircle color="#FFFFFF" size={28} strokeWidth={2.2} />
                </TouchableOpacity>
              </View>
            </View>
            {/* Label sits in the bar body zone */}
            <Text
              numberOfLines={1}
              style={[
                styles.tabLabel,
                {
                  color: isFocused ? colors.blue : '#9CA3AF',
                  fontWeight: isFocused ? '600' : '400',
                  marginTop: 4,
                },
              ]}
            >
              {label}
            </Text>
          </View>
        );
      })}

      {/* ── Tab row — flexible distribution to prevent text wrapping ── */}
      <View style={[styles.tabRow, { height: totalBarHeight, paddingBottom: insets.bottom }]}>
        {state.routes.map((route, index) => {
          if (route.name === 'Feedbacks') {
            return <View key={route.key} style={styles.tabItemSpacer} />;
          }

          const isFocused = state.index === index;
          const Icon      = iconMap[route.name] || Home;
          const config    = ROUTES.find(r => r.name === route.name);
          const label     = t(config?.labelKey || '');
          const color     = isFocused ? colors.blue : '#A0A5B1';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.7}
              onPress={onPress}
              style={styles.tabItem}
            >
              {/* Active overline indicator — Refined anchoring */}
              {isFocused && (
                <View style={[styles.activeIndicator, { backgroundColor: colors.blue }]} />
              )}
              <Icon
                color={color}
                size={24}
                strokeWidth={isFocused ? 2.5 : 1.8}
              />
              <Text
                numberOfLines={1}
                style={[
                  styles.tabLabel,
                  { color, fontWeight: isFocused ? '600' : '400' },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position:  'absolute',
    bottom:    0,
    width,
    backgroundColor: 'transparent',
  },

  unionImage: {
    position: 'absolute',
    bottom:   0,
    left:     0,
    width:    '100%',
  },

  centerOuter: {
    position:   'absolute',
    top:        0,
    left:       (width / 2) - (TAB_ITEM_WIDTH / 2),
    width:      TAB_ITEM_WIDTH,
    height:     98, // Base height before safe area
    alignItems: 'center',
    zIndex:     1,
  },

  // Outer diffused layer
  glowAura: {
    width:           90,
    height:          90,
    borderRadius:    45,
    backgroundColor: 'rgba(3, 135, 136, 0.04)', 
    alignItems:      'center',
    justifyContent:  'center',
    marginTop:       -10, // Pull further up into the arch
  },

  // Inner vibrant core
  glowCore: {
    width:           76,
    height:          76,
    borderRadius:    38,
    backgroundColor: 'rgba(3, 135, 136, 0.08)',
    alignItems:      'center',
    justifyContent:  'center',
  },

  centerBtn: {
    width:         60,
    height:        60,
    borderRadius:  30,
    alignItems:    'center',
    justifyContent:'center',
    ...Platform.select({
      ios: {
        shadowColor:   '#038788',
        shadowOffset:  { width: 0, height: 8 },
        shadowOpacity: 0.30,
        shadowRadius:  14,
      },
      android: { elevation: 14 },
    }),
  },

  tabRow: {
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
    flexDirection:   'row',
    alignItems:      'center',
  },

  tabItem: {
    flex:           1, // Flexible width to prevent text wrapping
    height:         '100%',
    alignItems:     'center',
    justifyContent: 'center',
    paddingTop:     TAB_ITEM_PAD_V,
    paddingHorizontal: 4, // Minimal horizontal safe zone
    gap:            TAB_ITEM_GAP,
  },

  tabItemSpacer: {
    width: TAB_ITEM_WIDTH,
  },

  tabLabel: {
    fontSize:   12,
    lineHeight: 14,
    includeFontPadding: false,
  },

  activeIndicator: {
    position:     'absolute',
    top:          12, // Lowered to feel anchored to the icon
    height:       2,   // Thinner, more elegant weight
    width:        24,  // Matches icon visual width
    borderRadius: 1,
  },
});


