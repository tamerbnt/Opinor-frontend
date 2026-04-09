import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions, TouchableOpacity, Image, StatusBar } from 'react-native';
import { AppText } from '../../components/ui/AppText';
import { useTheme } from '../../theme/ThemeContext';
import { ChevronRight } from 'lucide-react-native';

export const OnboardingScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const containerWidth = width > 500 ? 390 : width;

  // Final Geometric Lockdown (Figma 1610):
  // 1. Structural Layer (Wave): Vector 1, 2, 3 x3.png (Structural mesh/curve).
  // 2. Illustration Layer: onboard 1, 2, 3 x3.png (Overlaid illustration content).
  // Verticality (The 433/478 Final Handshake):
  //   - Slide 1 & 3: Anchored at 433px (Final 4px move 'UP' from 437 baseline).
  //   - Slide 2: Anchored at 478.57px (Symmetric deep valley).
  //   - Delta: ~45px allows curves to meet perfectly at the screen seam.
  
  const slides = [
    {
      title: "Collect Feedback Instantly",
      subtitle: "Let your customers share their opinions in seconds through QR codes or links - quick, simple, and reliable.",
      illustration: require('../../../assets/onboard 1 x3.png'),
      vector: require('../../../assets/Vector 1 x3.png'),
      vectorTop: 415,
      vectorScaleY: 1.10,
      illuW: 261,
      illuH: 255,
    },
    {
      title: "Understand What Matters",
      subtitle: "Visualize satisfaction trends, detect recurring issues, and track performance - all in one intuitive dashboard.",
      illustration: require('../../../assets/oboard 2 x3.png'),
      vector: require('../../../assets/Vector 2 x3.png'),
      vectorTop: 478.57,
      vectorScaleY: 1.0,
      illuW: 310,
      illuH: 300,
    },
    {
      title: "Act Before Problems Go Public",
      subtitle: "Get alerts on negative feedbacks and resolve issues privately - strengthen trust and keep your brand shining.",
      illustration: require('../../../assets/onboard 3 x3.png'),
      vector: require('../../../assets/Vector 3 x3.png'),
      vectorTop: 415,
      vectorScaleY: 1.10,
      illuW: 320,
      illuH: 310,
    }
  ];

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: (activeIndex + 1) * containerWidth, animated: true });
      setActiveIndex(activeIndex + 1);
    } else {
      navigation.navigate('TeamChoice');
    }
  };

  const handleScroll = (event: any) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / containerWidth);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      <View style={[styles.centerWrapper, { width: containerWidth }]}>
        <ScrollView 
          ref={scrollRef}
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollContainer}
        >
          {slides.map((slide, index) => (
            <View key={index} style={[styles.slide, { width: containerWidth }]}>
              
              {/* LAYER 1: Structural Background Wave (@3x) */}
              {/* FINAL 433px / 478.57px GEOMETRIC LOCK */}
              <View style={[styles.backgroundLayer, { top: slide.vectorTop }]}>
                <Image 
                  source={slide.vector} 
                  style={[styles.vectorImage, { transform: [{ scaleY: slide.vectorScaleY || 1.0 }] }]}
                  resizeMode="stretch"
                />
              </View>

              {/* LAYER 2: Illustration Overlay (@3x) */}
              <View style={styles.topSection}>
                <View style={[
                  styles.illustrationWrapper, 
                  { 
                    marginTop: 115,
                    width: slide.illuW,
                    height: slide.illuH 
                  }
                ]}>
                  <Image 
                    source={slide.illustration} 
                    style={styles.illustration}
                    resizeMode="contain"
                  />
                </View>
              </View>

              {/* Content Overlay */}
              <View style={styles.contentOverlay}>
                <AppText variant="h2" weight="bold" colorToken={colors.white} style={styles.title}>
                  {slide.title}
                </AppText>
                <AppText variant="body" colorToken="rgba(255,255,255,0.85)" style={styles.subtitle}>
                  {slide.subtitle}
                </AppText>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Floating Controls Row */}
        <View style={styles.controlsRow}>
          {/* Pagination Dots */}
          <View style={styles.dotsContainer}>
            {slides.map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.dot, 
                  { backgroundColor: i === activeIndex ? colors.blue : 'rgba(255,255,255,0.35)' },
                  i === activeIndex && styles.activeDot
                ]} 
              />
            ))}
          </View>

          {/* Circular Next Button */}
          <TouchableOpacity 
            onPress={handleNext}
            activeOpacity={0.8}
            style={[styles.nextButton, { borderColor: 'rgba(255,255,255,0.25)' }]}
          >
            <View style={[styles.nextButtonInner, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <ChevronRight color={colors.white} size={28} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  centerWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  scrollContainer: {
    flex: 1,
  },
  slide: {
    flex: 1,
  },
  backgroundLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  vectorImage: {
    width: '100%',
    height: '100%',
  },
  topSection: {
    height: '42%',
    width: '100%',
    alignItems: 'center',
    zIndex: 2,
  },
  illustrationWrapper: {
    width: 261,    
    height: 255,   
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  contentOverlay: {
    position: 'absolute',
    bottom: 0,
    height: '45%', 
    width: '100%',
    paddingHorizontal: 40,
    paddingTop: 70, 
    zIndex: 3,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 16,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'left',
    lineHeight: 22,
    maxWidth: '95%',
  },
  controlsRow: {
    position: 'absolute',
    bottom: 60,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  activeDot: {
    width: 32,
    borderRadius: 16,
  },
  nextButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
