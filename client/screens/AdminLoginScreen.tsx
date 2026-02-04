import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Platform,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AdminLoginScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/admin/login", credentials);
      return response.json();
    },
    onSuccess: () => {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/admin/session"] });
      navigation.replace("AdminDashboard");
    },
    onError: (err: Error) => {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      setError(err.message || "Invalid credentials");
    },
  });

  const handleLogin = () => {
    if (!username.trim()) {
      setError("Please enter username");
      return;
    }
    if (!password.trim()) {
      setError("Please enter password");
      return;
    }
    setError("");
    loginMutation.mutate({ username, password });
  };

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.content,
          { paddingTop: insets.top + Spacing["5xl"], paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.logoContainer}
        >
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText type="h2" style={styles.logoText}>
            Dean's Office
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.logoSubtext, { color: theme.textSecondary }]}
          >
            Admin Portal
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={[
            styles.loginCard,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.border,
            },
          ]}
        >
          <ThemedText type="h3" style={styles.cardTitle}>
            Admin Login
          </ThemedText>

          {error ? (
            <View
              style={[
                styles.errorBanner,
                { backgroundColor: theme.error + "20" },
              ]}
            >
              <Feather name="alert-circle" size={16} color={theme.error} />
              <ThemedText type="small" style={{ color: theme.error }}>
                {error}
              </ThemedText>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              Username
            </ThemedText>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
                },
              ]}
            >
              <Feather name="user" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Enter username"
                placeholderTextColor={theme.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                testID="input-admin-username"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              Password
            </ThemedText>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
                },
              ]}
            >
              <Feather name="lock" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Enter password"
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                testID="input-admin-password"
              />
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color={theme.textSecondary}
                onPress={() => setShowPassword(!showPassword)}
              />
            </View>
          </View>

          <Button
            onPress={handleLogin}
            disabled={loginMutation.isPending}
            style={styles.loginButton}
          >
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </Button>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.footer}
        >
          <ThemedText
            type="small"
            style={[styles.footerText, { color: theme.textSecondary }]}
          >
            Default credentials: admin / admin123
          </ThemedText>
        </Animated.View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: Spacing.lg,
  },
  logoText: {
    marginBottom: Spacing.xs,
  },
  logoSubtext: {
    textTransform: "uppercase",
    letterSpacing: 2,
    fontSize: 12,
  },
  loginCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  cardTitle: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.xs,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  loginButton: {
    marginTop: Spacing.md,
  },
  footer: {
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  footerText: {},
});
