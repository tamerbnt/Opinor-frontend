import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ReportsScreen } from '../screens/main/ReportsScreen';
import { ReportDetailScreen } from '../screens/main/ReportDetailScreen';

export type ReportsStackParamList = {
  ReportsList: undefined;
  ReportDetail: {
    id: string;
    month: string;
    year: number;
    total: number;
    negative: number;
    avgRating: string;
    growth: string;
    ratingDist: number[];
    activity: number[];
    activityLabels: string[];
    issue: string;
    issuePercent: number;
  };
};

const Stack = createNativeStackNavigator<ReportsStackParamList>();

export const ReportsNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ReportsList"  component={ReportsScreen} />
    <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
  </Stack.Navigator>
);
