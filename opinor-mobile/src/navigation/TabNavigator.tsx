import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { CustomTabBar } from '../components/ui/CustomTabBar';
import { DashboardScreen } from '../screens/main/DashboardScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { ReportsNavigator } from './ReportsNavigator';
import { FeedbacksScreen } from '../screens/main/FeedbacksScreen';

const Tab = createBottomTabNavigator();

// Placeholder screens — to be replaced when those tabs are designed
const NotificationsScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Notifications</Text></View>;

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,        // ← eliminates the phantom gear/header icon
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen name="Home"          component={DashboardScreen}      options={{ headerShown: false }} />
      <Tab.Screen name="Reports"       component={ReportsNavigator}     options={{ headerShown: false }} />
      <Tab.Screen name="Feedbacks"     component={FeedbacksScreen}      options={{ headerShown: false }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen}  options={{ headerShown: false }} />
      <Tab.Screen name="Profile"       component={ProfileScreen}        options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};
