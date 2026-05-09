import React, { ReactNode } from "react";
import {
  ImageBackground,
  ImageSourcePropType,
  StyleSheet,
  View,
} from "react-native";

type ScreenBackgroundProps = {
  children: ReactNode;
  source?: ImageSourcePropType;
  overlayColor?: string;
};

export default function ScreenBackground({
  children,
  source = require("../../assets/onboarding-bg.png"),
  overlayColor = "rgba(3, 7, 18, 0.54)",
}: ScreenBackgroundProps) {
  return (
    <ImageBackground
      source={source}
      style={styles.background}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={[styles.overlay, { backgroundColor: overlayColor }]} />
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#050A14",
  },

  backgroundImage: {
    resizeMode: "cover",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
