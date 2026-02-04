import React from "react";
import { View, StyleSheet, Pressable, Platform, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const handleAdminLogin = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("AdminLogin");
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing["3xl"],
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      >
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.logoSection}
        >
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText type="h2" style={styles.appName}>
            Dean Appointments
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.appTagline, { color: theme.textSecondary }]}
          >
            Schedule meetings with the Dean's Office
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.border,
            },
          ]}
        >
          <ThemedText type="h4" style={styles.cardTitle}>
            About This App
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.cardText, { color: theme.textSecondary }]}
          >
            This application allows students, parents, visitors, and staff to
            request appointments with the college dean. Simply fill out the form
            on the Home tab and check your status anytime.
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.border,
            },
          ]}
        >
          <ThemedText type="h4" style={styles.cardTitle}>
            Office Hours
          </ThemedText>
          <View style={styles.hoursRow}>
            <Feather name="clock" size={18} color={theme.textSecondary} />
            <ThemedText type="body">Monday - Friday</ThemedText>
          </View>
          <ThemedText
            type="body"
            style={[styles.hoursDetail, { color: theme.textSecondary }]}
          >
            9:00 AM - 5:00 PM
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.border,
            },
          ]}
        >
          <ThemedText type="h4" style={styles.cardTitle}>
            Contact Information
          </ThemedText>
          <View style={styles.contactRow}>
            <Feather name="mail" size={18} color={theme.textSecondary} />
            <ThemedText type="body">dean.office@college.edu</ThemedText>
          </View>
          <View style={styles.contactRow}>
            <Feather name="phone" size={18} color={theme.textSecondary} />
            <ThemedText type="body">(555) 123-4567</ThemedText>
          </View>
          <View style={styles.contactRow}>
            <Feather name="map-pin" size={18} color={theme.textSecondary} />
            <ThemedText type="body">Administration Building, Room 101</ThemedText>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <Pressable
            style={[
              styles.adminButton,
              { backgroundColor: theme.backgroundSecondary },
            ]}
            onPress={handleAdminLogin}
          >
            <Feather name="lock" size={20} color={theme.text} />
            <ThemedText type="body" style={{ fontWeight: "500" }}>
              Admin Login
            </ThemedText>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(600).duration(500)}
          style={styles.versionInfo}
        >
          <ThemedText
            type="small"
            style={{ color: theme.textSecondary, textAlign: "center" }}
          >
            Version 1.0.0
          </ThemedText>
          <ThemedText
            type="small"
            style={{ color: theme.textSecondary, textAlign: "center" }}
          >
            Dean Appointment Scheduling System
          </ThemedText>
        </Animated.View>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: Spacing.lg,
  },
  appName: {
    marginBottom: Spacing.xs,
  },
  appTagline: {
    textAlign: "center",
  },
  infoCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    marginBottom: Spacing.md,
  },
  cardText: {
    lineHeight: 24,
  },
  hoursRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  hoursDetail: {
    marginLeft: 26,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  adminButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  versionInfo: {
    paddingVertical: Spacing.xl,
    gap: Spacing.xs,
  },
});
