import React from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions, Image, StatusBar, TouchableOpacity } from 'react-native';
import { AppText } from '../../components/ui/AppText';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { CustomInput } from '../../components/ui/CustomInput';
import { useTheme } from '../../theme/ThemeContext';

export const BookingFormScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const containerWidth = width > 500 ? 390 : width;

  return (
    <View style={[styles.container, { backgroundColor: colors.white }]}>
      <StatusBar barStyle="dark-content" />
      
      <View style={[styles.centerWrapper, { width: containerWidth }]}>
        <View style={styles.header}>
          <Image 
            source={require('../../../assets/white vertical 2 (2).png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <AppText variant="h2" weight="bold" colorToken={colors.dark} style={styles.title}>
            Book a meeting
          </AppText>

          <View style={styles.form}>
            <CustomInput label="Full Name" placeholder="Enter your full name" />
            <CustomInput label="Email" placeholder="Enter your email" keyboardType="email-address" />
            <CustomInput label="Phone number" placeholder="Enter your phone number" keyboardType="phone-pad" />
            <CustomInput label="Additional note" placeholder="..." multiline numberOfLines={3} style={styles.textArea} />
          </View>

          <PrimaryButton 
            label="Book now" 
            onPress={() => navigation.navigate('BookingSuccess')} 
            style={styles.submitButton}
          />

          <TouchableOpacity 
            onPress={() => navigation.navigate('Login')}
            style={styles.loginLink}
          >
            <AppText variant="caption">
              Already have an account? <AppText variant="caption" weight="bold" colorToken={colors.blue}>Login</AppText>
            </AppText>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  centerWrapper: {
    flex: 1,
    paddingHorizontal: 30,
  },
  header: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  logo: {
    width: 180,
    height: 140,
  },
  title: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  form: {
    marginBottom: 30,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'bottom',
    paddingBottom: 12,
  },
  submitButton: {
    marginBottom: 20,
  },
  loginLink: {
    alignItems: 'center',
    paddingBottom: 40,
  }
});
