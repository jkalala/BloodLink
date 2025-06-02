import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps } from '../types/navigation';

const slides = [
  {
    id: '1',
    title: 'Save Lives with BloodLink',
    description: 'Connect blood donors with hospitals in real-time during emergencies.',
    image: require('../assets/onboarding-1.png'), // TODO: Add these images
  },
  {
    id: '2',
    title: 'Quick Response',
    description: 'Get instant notifications when your blood type is needed nearby.',
    image: require('../assets/onboarding-2.png'),
  },
  {
    id: '3',
    title: 'Easy to Use',
    description: 'Simple registration process and real-time updates on blood requests.',
    image: require('../assets/onboarding-3.png'),
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<RootStackScreenProps<'Onboarding'>['navigation']>();
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      navigation.navigate('UserTypeSelection');
    }
  };

  const handleSkip = () => {
    navigation.navigate('UserTypeSelection');
  };

  const renderSlide = ({ item }: { item: typeof slides[0] }) => (
    <View style={[styles.slide, { width }]}>
      <Image source={item.image} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>

        {currentIndex === slides.length - 1 && (
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  skipContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  skipText: {
    fontSize: 16,
    color: '#4a5568',
    fontWeight: '600',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  image: {
    width: '80%',
    height: 300,
    resizeMode: 'contain',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a202c',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#e53e3e',
    width: 24,
  },
  button: {
    backgroundColor: '#e53e3e',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 14,
    color: '#4a5568',
  },
  loginLink: {
    fontSize: 14,
    color: '#e53e3e',
    fontWeight: '600',
  },
}); 