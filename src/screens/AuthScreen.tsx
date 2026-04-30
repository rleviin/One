import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type AuthScreenProps = {
  onDone: () => void;
};

export default function AuthScreen({ onDone }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  return (
    <ImageBackground
      source={require("../../assets/onboarding-bg_1.png")}
      style={styles.screenBackgroundImage}
      imageStyle={styles.screenBackgroundImageInner}
      resizeMode="cover"
    >
      <View style={styles.authImageOverlay} />

      <SafeAreaView style={styles.authContainer}>
        <View style={styles.authTopBrand}>
          <Text style={styles.authTopBrandText}>DARA AI</Text>
        </View>

        <View style={styles.authCard}>
          <Text style={styles.authTitle}>
            {mode === "login" ? "Welcome back" : "Create account"}
          </Text>

          <Text style={styles.authSubtitle}>
            {mode === "login"
              ? "Log in to continue your journey with Dara."
              : "Sign up to start your journey with Dara."}
          </Text>

          <View style={styles.authSwitch}>
            <Pressable
              style={[
                styles.authSwitchTab,
                mode === "login" && styles.authSwitchTabActive,
              ]}
              onPress={() => setMode("login")}
            >
              <Text
                style={[
                  styles.authSwitchText,
                  mode === "login" && styles.authSwitchTextActive,
                ]}
              >
                Log in
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.authSwitchTab,
                mode === "signup" && styles.authSwitchTabActive,
              ]}
              onPress={() => setMode("signup")}
            >
              <Text
                style={[
                  styles.authSwitchText,
                  mode === "signup" && styles.authSwitchTextActive,
                ]}
              >
                Sign up
              </Text>
            </Pressable>
          </View>

          {mode === "signup" && (
            <View style={styles.authFieldBlock}>
              <Text style={styles.authFieldLabel}>NAME</Text>
              <View style={styles.authInputWrap}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="rgba(255,255,255,0.6)"
                />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor="rgba(255,255,255,0.45)"
                  style={styles.authInput}
                />
              </View>
            </View>
          )}

          <View style={styles.authFieldBlock}>
            <Text style={styles.authFieldLabel}>EMAIL</Text>
            <View style={styles.authInputWrap}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="rgba(255,255,255,0.6)"
              />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="rgba(255,255,255,0.45)"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.authInput}
              />
            </View>
          </View>

          <View style={styles.authFieldBlock}>
            <Text style={styles.authFieldLabel}>PASSWORD</Text>
            <View style={styles.authInputWrap}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="rgba(255,255,255,0.6)"
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="rgba(255,255,255,0.45)"
                secureTextEntry
                style={styles.authInput}
              />
              <Ionicons
                name="eye-outline"
                size={20}
                color="rgba(255,255,255,0.5)"
              />
            </View>
          </View>

          {mode === "login" && (
            <Pressable>
              <Text style={styles.authForgot}>Forgot password?</Text>
            </Pressable>
          )}

          <Pressable style={styles.authPrimaryButton} onPress={onDone}>
            <Text style={styles.authPrimaryButtonText}>
              {mode === "login" ? "Continue" : "Create account"}
            </Text>
          </Pressable>

          <View style={styles.authFooterRow}>
            <View style={styles.authFooterIcon}>
              <Ionicons
                name="lock-closed-outline"
                size={14}
                color="rgba(255,255,255,0.72)"
              />
            </View>
            <Text style={styles.authFooterText}>
              Your data is private and secure.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screenBackgroundImage: {
    flex: 1,
    backgroundColor: "#050A14",
  },

  screenBackgroundImageInner: {
    resizeMode: "cover",
  },

  authImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(3, 7, 18, 0.42)",
  },

  authContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "transparent",
  },

  authTopBrand: {
    alignItems: "center",
    marginBottom: 26,
  },

  authTopBrandText: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 8,
  },

  authCard: {
    backgroundColor: "rgba(10, 18, 44, 0.58)",
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
  },

  authTitle: {
    color: "#FFFFFF",
    fontSize: 31,
    fontWeight: "800",
    lineHeight: 37,
  },

  authSubtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
    marginBottom: 24,
  },

  authSwitch: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    padding: 4,
    marginBottom: 24,
  },

  authSwitchTab: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  authSwitchTabActive: {
    backgroundColor: "rgba(107, 126, 255, 0.28)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },

  authSwitchText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
    fontWeight: "600",
  },

  authSwitchTextActive: {
    color: "#FFFFFF",
  },

  authFieldBlock: {
    marginBottom: 20,
  },

  authFieldLabel: {
    color: "rgba(255,255,255,0.64)",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 2.2,
    marginBottom: 10,
  },

  authInputWrap: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
    backgroundColor: "rgba(255,255,255,0.05)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  authInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 18,
    marginLeft: 12,
  },

  authForgot: {
    color: "#B98DFF",
    fontSize: 15,
    textAlign: "right",
    marginTop: -2,
    marginBottom: 24,
  },

  authPrimaryButton: {
    marginTop: 6,
    backgroundColor: "#FFFFFF",
    minHeight: 60,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  authPrimaryButtonText: {
    color: "#09132B",
    fontSize: 20,
    fontWeight: "800",
  },

  authFooterRow: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  authFooterIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  authFooterText: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 15,
  },
});
