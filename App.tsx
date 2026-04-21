import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import WelcomePremium from "./src/screens/WelcomePremium";

export default function App() {
  const [stage, setStage] = useState<"welcome" | "auth">("welcome");

  if (stage === "welcome") {
    return <WelcomePremium onStart={() => setStage("auth")} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Auth screen</Text>
        <Text style={styles.subtitle}>Здесь позже будет регистрация / вход</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1020",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 10,
  },
  subtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 16,
    textAlign: "center",
  },
});
