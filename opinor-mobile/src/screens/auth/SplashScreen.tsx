import React, { useEffect } from 'react';
import { View, StyleSheet, Image, ImageBackground, StatusBar } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export const SplashScreen = ({ navigation }: any) => {
  const { colors } = useTheme();

  useEffect(() => {
    // Delay to allow the brand impression to sink in
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

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

