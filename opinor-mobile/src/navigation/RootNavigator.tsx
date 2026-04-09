import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';
import { useAuthStore } from '../store/useAuthStore';

export const RootNavigator = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  return (
    <NavigationContainer>
      {accessToken ? <TabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
