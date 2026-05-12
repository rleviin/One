import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { loginDaraUser, signupDaraUser } from "../lib/auth-client";

type AuthScreenProps = {
  onDone: () => void;
};

export default function AuthScreen({ onDone }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleAuthSubmit() {
    if (isSubmitting) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await loginDaraUser({ email, password });
      } else {
        await signupDaraUser({ email, password, name });
      }

      onDone();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Authentication failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

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

          {errorMessage ? (
            <Text style={styles.authErrorText}>{errorMessage}</Text>
          ) : null}

          <Pressable
            style={[
              styles.authPrimaryButton,
              isSubmitting && styles.authPrimaryButtonDisabled,
            ]}
            onPress={handleAuthSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.authPrimaryButtonText}>
              {isSubmitting
                ? "Please wait..."
                : mode === "login"
                  ? "Continue"
                  : "Create account"}
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
    paddingHorizontal: 34,
    backgroundColor: "transparent",
  },

  authTopBrand: {
    alignItems: "center",
    marginBottom: 18,
  },

  authTopBrandText: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 8,
  },

  authCard: {
    backgroundColor: "rgba(10, 18, 44, 0.54)",
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
  },

  authTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 33,
  },

  authSubtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 18,
  },

  authSwitch: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    padding: 4,
    marginBottom: 18,
  },

  authSwitchTab: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 11,
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
    marginBottom: 14,
  },

  authFieldLabel: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.2,
    marginBottom: 7,
  },

  authInputWrap: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
    backgroundColor: "rgba(255,255,255,0.05)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  authInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    marginLeft: 10,
  },

  authForgot: {
    color: "#B98DFF",
    fontSize: 13,
    textAlign: "right",
    marginTop: -2,
    marginBottom: 16,
  },

  authErrorText: {
    color: "#FF9AA8",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  authPrimaryButtonDisabled: {
    opacity: 0.64,
  },

  authPrimaryButton: {
    marginTop: 4,
    backgroundColor: "#FFFFFF",
    minHeight: 52,
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
