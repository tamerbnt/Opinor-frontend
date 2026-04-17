import React, { useEffect } from 'react';
import { View, StyleSheet, Image, ImageBackground, StatusBar } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../store/useAuthStore';
import { getStartupData } from '../../api/dashboard';

export const SplashScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const signIn = useAuthStore(state => state.signIn);

  useEffect(() => {
    const bootstrapAsync = async () => {
      const minDelay = new Promise(resolve => setTimeout(resolve, 1500)); // Minimum branding delay

      try {
        const token = await SecureStore.getItemAsync('accessToken');
        const userProfileStr = await SecureStore.getItemAsync('userProfile');
        
        if (token) {
          // Prefetch everything in parallel with the delay
          const prefetchPromise = queryClient.prefetchQuery({
            queryKey: ['dashboardStartup'],
            queryFn: getStartupData,
            staleTime: 1000 * 60 * 5, // Keep it fresh for 5 mins
          }).catch(err => console.log('Prefetch failed:', err));

          await Promise.all([minDelay, prefetchPromise]);
          
          // EDGE CASE: If the token was expired, the Axios interceptor might have called signOut() 
          // internally and deleted the token from SecureStore during the prefetch. 
          // We must verify the token survived the prefetch before committing it to state.
          const survivedToken = await SecureStore.getItemAsync('accessToken');
          if (!survivedToken) {
            navigation.replace('Onboarding');
            return;
          }

          // Re-hydrate auth store to trigger RootNavigator swap
          let profile = null;
          try { if (userProfileStr) profile = JSON.parse(userProfileStr); } catch(e) {}
          await signIn(survivedToken, profile);
          
          return; // Stop here, RootNavigator unmounts us
        }
      } catch (e) {
        console.log('Bootstrap error', e);
      }

      await minDelay;
      navigation.replace('Onboarding');
    };

    bootstrapAsync();
  }, [navigation, queryClient, signIn]);

  return (
    <View style={styles.container}>
      {/* Background Mesh Gradient Asset */}
      <ImageBackground 
        source={require('../../../assets/rectangle.png')} 
        style={styles.background}
        resizeMode="cover"
      >
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        
        {/* Layered Branding Stack for Perfect Centering */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/logo_white x3.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logo: {
    width: 280, // High-fidelity scale based on the 390px width reference
    height: 300,
  }
});

