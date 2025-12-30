import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { SheepCharacter } from '../components';
import { PrimaryButton } from '../components';

type RootStackParamList = {
  Home: undefined;
  CourtList: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handleNavigateToCourt = () => {
    console.log('🏀 [HomeScreen] 대관 정보로 이동');
    navigation.navigate('CourtList');
  };

  const handleCharacterPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <LinearGradient
      colors={['#F5B740', '#F2A93F']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Background Decorative Sheep - Top Left */}
        <View style={styles.decorativeSheepTopLeft}>
          <SheepCharacter variant="white" size="medium" />
        </View>

        {/* Background Decorative Sheep - Top Right */}
        <View style={styles.decorativeSheepTopRight}>
          <SheepCharacter variant="black" size="medium" />
        </View>

        {/* Background Decorative Sheep - Bottom Left */}
        <View style={styles.decorativeSheepBottomLeft}>
          <SheepCharacter variant="white" size="medium" />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Hero Sheep Character */}
          <Pressable onPress={handleCharacterPress}>
            <Animated.View
              style={[
                styles.heroSheepContainer,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <SheepCharacter variant="white" size="large" />
            </Animated.View>
          </Pressable>

          {/* Welcome Card */}
          <View style={styles.welcomeCard}>
            {/* Speech Bubble Triangle */}
            <View style={styles.speechBubbleTriangle} />

            <View style={styles.welcomeContent}>
              <Text style={styles.welcomeTitle}>
                양도합니다!{'\n'}농구장 양도 플랫폼 🐑
              </Text>
              <Text style={styles.welcomeMessage}>
                각종 카페에서 올라오는 대관 양도글을 한눈에!{'\n'}
                양들도 하는데 당신도 할수 있다!!
              </Text>
              <View style={styles.buttonContainer}>
                <PrimaryButton onPress={handleNavigateToCourt}>
                  🏀 농구장 대관 보기
                </PrimaryButton>
              </View>
            </View>
          </View>

          {/* Footer Text */}
          <Text style={styles.footerText}>
            양도합니다!
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  decorativeSheepTopLeft: {
    position: 'absolute',
    top: 40,
    left: 40,
    opacity: 0.2,
    zIndex: 0,
  },
  decorativeSheepTopRight: {
    position: 'absolute',
    top: 80,
    right: 40,
    opacity: 0.2,
    zIndex: 0,
  },
  decorativeSheepBottomLeft: {
    position: 'absolute',
    bottom: 128,
    left: 64,
    opacity: 0.15,
    zIndex: 0,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 32,
    zIndex: 10,
  },
  heroSheepContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeCard: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    maxWidth: width - 48,
    width: '100%',
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  speechBubbleTriangle: {
    position: 'absolute',
    top: -17,
    left: '50%',
    marginLeft: -17,
    width: 34,
    height: 34,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  welcomeContent: {
    position: 'relative',
    zIndex: 10,
    alignItems: 'center',
    gap: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  welcomeTitle: {
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
    textAlign: 'center',
    color: '#111111',
    marginBottom: 0,
  },
  welcomeMessage: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22.75,
    textAlign: 'center',
    color: '#222222',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    textAlign: 'center',
    color: '#111111',
    opacity: 0.7,
    maxWidth: 320,
  },
});

export default HomeScreen;
