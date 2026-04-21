import React, { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";

type Props = { onStart: () => void };

export default function WelcomePremium({ onStart }: Props) {
  const breathe = useRef(new Animated.Value(0)).current;
  const floatX = useRef(new Animated.Value(0)).current;
  const floatY = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 5400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 5400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(floatX, {
            toValue: 12,
            duration: 6000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(floatY, {
            toValue: -10,
            duration: 6000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(floatX, {
            toValue: -10,
            duration: 6000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(floatY, {
            toValue: 8,
            duration: 6000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(textY, {
        toValue: 0,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [breathe, floatX, floatY, textOpacity, textY]);

  const scale = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1.04],
  });

  return (
    <View style={styles.screen}>
      <Animated.View
        style={[
          styles.blobWrap,
          {
            transform: [{ translateX: floatX }, { translateY: floatY }, { scale }],
          },
        ]}
      >
        <View style={styles.glow} />
        <View style={styles.blobBase}>
          <View style={styles.blobLayerOne} />
          <View style={styles.blobLayerTwo} />
          <View style={styles.blobLayerThree} />
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.textWrap,
          { opacity: textOpacity, transform: [{ translateY: textY }] },
        ]}
      >
        <Text style={styles.title}>Hi, I’m Dara</Text>
        <Text style={styles.subtitle}>
          Your AI assistant for balance and clarity
        </Text>
      </Animated.View>

      <Pressable style={styles.button} onPress={onStart}>
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F9FB",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  blobWrap: {
    width: 280,
    height: 280,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 999,
    backgroundColor: "#7B6EF6",
    opacity: 0.12,
  },
  blobBase: {
    width: 240,
    height: 240,
    borderRadius: 90,
    backgroundColor: "#B9B3FF",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "8deg" }],
    overflow: "hidden",
  },
  blobLayerOne: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 80,
    backgroundColor: "#7B6EF6",
    top: 12,
    left: 10,
    opacity: 0.9,
  },
  blobLayerTwo: {
    position: "absolute",
    width: 165,
    height: 165,
    borderRadius: 70,
    backgroundColor: "#38BDF8",
    bottom: 16,
    right: 12,
    opacity: 0.88,
  },
  blobLayerThree: {
    position: "absolute",
    width: 145,
    height: 145,
    borderRadius: 60,
    backgroundColor: "#FBCFE8",
    bottom: 28,
    left: 30,
    opacity: 0.92,
  },
  textWrap: {
    marginTop: 26,
    alignItems: "center",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#475569",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
  },
  button: {
    marginTop: 32,
    backgroundColor: "#111827",
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 14,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
