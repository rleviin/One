import React, { useState } from "react";
import { SafeAreaView, View, Text, Pressable, StyleSheet } from "react-native";
import HomeScreen from "./app/index";

export default function App() {
  const [started, setStarted] = useState(false);

  if (started) return <HomeScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.wrap}>
        <Text style={styles.title}>Dara</Text>
        <Text style={styles.subtitle}>
          Прогнозируй риски и управляй своим будущим
        </Text>
        <Pressable style={styles.btn} onPress={() => setStarted(true)}>
          <Text style={styles.btnText}>Начать</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F4F7FB" },
  wrap: { flex: 1, justifyContent: "center", padding: 24, gap: 14 },
  title: { fontSize: 40, fontWeight: "800", color: "#0F172A" },
  subtitle: { fontSize: 17, color: "#334155", lineHeight: 24 },
  btn: { backgroundColor: "#1D4ED8", borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" }
});
