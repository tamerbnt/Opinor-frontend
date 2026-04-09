import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { View } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Keep the splash screen visible while we fetch custom fonts
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// Abstracted sub-component to consume the ThemeContext
const AppContent = () => {
  const { colors, isDark } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? colors.dark : colors.white }}>
      <RootNavigator />
      <StatusBar style={isDark ? "light" : "dark"} />
    </View>
  );
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync(); // Hide splash screen once fonts are locked in
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Return empty until UI is 100% ready to render
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
