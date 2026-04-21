import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from "react-native";

export default function AuthScreen() {
  const [mode, setMode] = useState("login");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.switch}>
          <Pressable onPress={() => setMode("login")}>
            <Text style={mode === "login" ? styles.active : styles.inactive}>
              Log in
            </Text>
          </Pressable>

          <Pressable onPress={() => setMode("signup")}>
            <Text style={mode === "signup" ? styles.active : styles.inactive}>
              Sign up
            </Text>
          </Pressable>
        </View>

        <Text style={styles.title}>
          {mode === "login" ? "Welcome back" : "Create account"}
        </Text>

        {mode === "signup" && (
          <TextInput placeholder="Name" style={styles.input} />
        )}

        <TextInput placeholder="Email" style={styles.input} />

        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
        />

        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>
            {mode === "login" ? "Log in" : "Sign up"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },
  switch: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  active: {
    fontWeight: "700",
  },
  inactive: {
    color: "#aaa",
  },
  title: {
    fontSize: 20,
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
  },
});
