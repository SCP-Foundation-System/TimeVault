import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

const WELCOME_WORDS = [
  'Welcome',
  'Willkommen',
  'Bienvenue',
  'Bienvenido',
  'Benvenuto',
  'Bem-vindo',
  'Välkommen',
  'Hoş geldiniz',
  'ようこそ',
  '환영합니다'
];

interface IntroScreenProps {
  onDone: () => void;
}

export function IntroScreen({ onDone }: IntroScreenProps) {
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(16)).current;

  const currentWord = useMemo(() => WELCOME_WORDS[index], [index]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % WELCOME_WORDS.length);
    }, 350);

    const stopTimer = setTimeout(() => {
      clearInterval(interval);
      onDone();
    }, 2600);

    return () => {
      clearInterval(interval);
      clearTimeout(stopTimer);
    };
  }, [onDone]);

  useEffect(() => {
    fade.setValue(0);
    slideY.setValue(16);

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad)
      }),
      Animated.timing(slideY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad)
      })
    ]).start();
  }, [currentWord, fade, slideY]);

  return (
    <View style={styles.container}>
      <View style={styles.overlay} />
      <Text style={styles.brand}>TimeVault</Text>
      <Animated.Text style={[styles.word, { opacity: fade, transform: [{ translateY: slideY }] }]}>
        {currentWord}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F162A'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#131E39'
  },
  brand: {
    color: '#8EA3FF',
    fontSize: 18,
    letterSpacing: 2,
    marginBottom: 14,
    fontWeight: '700'
  },
  word: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 0.4
  }
});
