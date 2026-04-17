import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CustomTabBar } from '../components/ui/CustomTabBar';
import { DashboardScreen } from '../screens/main/DashboardScreen';
import { ReportsNavigator } from './ReportsNavigator';
import { FeedbacksScreen } from '../screens/main/FeedbacksScreen';
import { NotificationsScreen } from '../screens/main/NotificationsScreen';
import { ProfileNavigator } from './ProfileNavigator';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen name="Home"          component={DashboardScreen}      options={{ headerShown: false }} />
      <Tab.Screen name="Reports"       component={ReportsNavigator}     options={{ headerShown: false }} />
      <Tab.Screen name="Feedbacks"     component={FeedbacksScreen}      options={{ headerShown: false }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen}  options={{ headerShown: false }} />
      <Tab.Screen name="Profile"       component={ProfileNavigator}     options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};
