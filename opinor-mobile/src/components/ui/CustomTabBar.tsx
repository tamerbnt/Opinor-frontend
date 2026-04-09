import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Dimensions, Platform, Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, BarChart2, MessageCircle, Bell, User } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const TAB_BAR_HEIGHT = 92;

const ROUTES: { name: string; label: string }[] = [
  { name: 'Home',          label: 'Home' },
  { name: 'Reports',       label: 'Analytics' },
  { name: 'Feedbacks',     label: '' },        // No label for center
  { name: 'Notifications', label: 'Alerts' },
  { name: 'Profile',       label: 'Profile' },
];

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);
  const totalHeight = TAB_BAR_HEIGHT + bottomPad;

  const iconMap: Record<string, any> = {
    Home:          Home,
    Reports:       BarChart2,
    Feedbacks:     MessageCircle,
    Notifications: Bell,
    Profile:       User,
  };

  const barBg       = isDark ? '#1A1D21' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  return (
    <View style={[styles.container, { height: totalHeight }]}>
      {/* Union.png wave shape */}
      <Image
        source={require('../../../assets/Union.png')}
        style={[styles.unionImage, { tintColor: barBg }]}
        resizeMode="stretch"
      />

      {/* ── Tab items ── */}
      <View style={[styles.tabRow, { height: TAB_BAR_HEIGHT, paddingBottom: 4 }]}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const Icon      = iconMap[route.name] || Home;
          const config    = ROUTES.find(r => r.name === route.name);
          const label     = config?.label ?? route.name;
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

          // ── Centre button ──
          if (route.name === 'Feedbacks') {
            return (
              <View key={route.key} style={styles.centerOuter}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={onPress}
                  style={[styles.centerBtn, { backgroundColor: colors.blue }]}
                >
                  <MessageCircle color="#FFFFFF" size={30} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            );
          }

          // ── Regular tab item ──
          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.7}
              onPress={onPress}
              style={styles.tabItem}
            >
              <Icon color={color} size={28} strokeWidth={isFocused ? 2.5 : 1.8} />
              <Text style={[styles.tabLabel, { color, fontWeight: isFocused ? '700' : '500' }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width,
    backgroundColor: 'transparent',
  },
  unionImage: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 110,
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  centerOuter: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: -40,
  },
  centerBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3.5,
    borderColor: 'rgba(255,255,255,0.9)',
    ...Platform.select({
      ios: {
        shadowColor: '#038788',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.40,
        shadowRadius: 10,
      },
      android: { elevation: 10 },
    }),
  },
});
