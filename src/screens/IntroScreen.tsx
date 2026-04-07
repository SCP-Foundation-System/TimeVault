import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

// Reihenfolge ist bewusst kuratiert, damit der Abschluss immer "Willkommen" ist.
const INTRO_WORDS = ['Welcome', 'Bienvenue', 'Bienvenido', 'Benvenuto', 'Bem-vindo', 'Välkommen'];
const FINAL_WORD = 'Willkommen';

interface IntroScreenProps {
  onDone: () => void;
}

export function IntroScreen({ onDone }: IntroScreenProps) {
  const [index, setIndex] = useState(0);
  const [showFinalWord, setShowFinalWord] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(16)).current;

  const currentWord = useMemo(() => {
    if (showFinalWord) return FINAL_WORD;
    return INTRO_WORDS[index] ?? INTRO_WORDS[0];
  }, [index, showFinalWord]);

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    // Zeigt nacheinander mehrere Übersetzungen an.
    INTRO_WORDS.forEach((_, wordIndex) => {
      timeouts.push(
        setTimeout(() => {
          setIndex(wordIndex);
        }, wordIndex * 300)
      );
    });

    // Letztes Wort ist immer "Willkommen".
    const finalWordStart = INTRO_WORDS.length * 300;
    timeouts.push(
      setTimeout(() => {
        setShowFinalWord(true);
      }, finalWordStart)
    );

    // "Willkommen" bleibt ~1s sichtbar.
    timeouts.push(
      setTimeout(() => {
        onDone();
      }, finalWordStart + 1000)
    );

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [onDone]);

  useEffect(() => {
    fade.setValue(0);
    slideY.setValue(16);

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad)
      }),
      Animated.timing(slideY, {
        toValue: 0,
        duration: 260,
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
