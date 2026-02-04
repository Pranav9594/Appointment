import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import type { Appointment } from "@shared/schema";

type SearchResult = {
  found: boolean;
  appointments?: Appointment[];
};

export default function CheckStatusScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await apiRequest(
        "GET",
        `/api/appointments/search?email=${encodeURIComponent(email)}`
      );
      const data = await response.json();
      
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      setSearchResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to search appointments");
      setSearchResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return isDark ? Colors.dark.success : Colors.light.success;
      case "Rejected":
        return isDark ? Colors.dark.error : Colors.light.error;
      default:
        return isDark ? Colors.dark.warning : Colors.light.warning;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing["3xl"],
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <View style={styles.heroSection}>
            <ThemedText type="h1" style={styles.title}>
              Check Status
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.subtitle, { color: theme.textSecondary }]}
            >
              Enter your email address to view the status of your appointment
              requests.
            </ThemedText>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={[
            styles.searchCard,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              Email Address
            </ThemedText>
            <View style={styles.searchRow}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                    borderColor: error ? theme.error : theme.border,
                  },
                ]}
                placeholder="your.email@example.com"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                testID="input-search-email"
              />
            </View>
            {error ? (
              <ThemedText
                type="small"
                style={[styles.errorText, { color: theme.error }]}
              >
                {error}
              </ThemedText>
            ) : null}
          </View>

          <Button
            onPress={handleSearch}
            disabled={isLoading}
            style={styles.searchButton}
          >
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </Animated.View>

        {searchResult !== null ? (
          <Animated.View entering={FadeIn.duration(400)}>
            {searchResult.found && searchResult.appointments && searchResult.appointments.length > 0 ? (
              searchResult.appointments.map((appointment, index) => (
                <Animated.View
                  key={appointment.id}
                  entering={FadeInDown.delay(100 * index).duration(400)}
                  style={[
                    styles.resultCard,
                    {
                      backgroundColor: theme.backgroundDefault,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <View style={styles.resultHeader}>
                    <View>
                      <ThemedText type="h4">{appointment.name}</ThemedText>
                      <ThemedText
                        type="small"
                        style={{ color: theme.textSecondary }}
                      >
                        {appointment.role}
                      </ThemedText>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(appointment.status) },
                      ]}
                    >
                      <ThemedText type="small" style={styles.statusText}>
                        {appointment.status.toUpperCase()}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.resultDetails}>
                    <View style={styles.detailRow}>
                      <Feather
                        name="calendar"
                        size={16}
                        color={theme.textSecondary}
                      />
                      <ThemedText type="body">
                        Requested: {formatDate(appointment.preferredDate)}
                      </ThemedText>
                    </View>

                    {appointment.status === "Approved" && appointment.timeSlot ? (
                      <View
                        style={[
                          styles.approvedInfo,
                          { backgroundColor: theme.primaryLight },
                        ]}
                      >
                        <Feather
                          name="check-circle"
                          size={20}
                          color={getStatusColor("Approved")}
                        />
                        <View style={styles.approvedDetails}>
                          <ThemedText type="small" style={{ fontWeight: "600" }}>
                            Confirmed Appointment
                          </ThemedText>
                          <ThemedText type="h4">
                            {formatDate(appointment.preferredDate)} at{" "}
                            {appointment.timeSlot}
                          </ThemedText>
                        </View>
                      </View>
                    ) : null}

                    <View style={styles.reasonSection}>
                      <ThemedText
                        type="small"
                        style={{ color: theme.textSecondary, fontWeight: "500" }}
                      >
                        Reason:
                      </ThemedText>
                      <ThemedText
                        type="small"
                        style={{ color: theme.textSecondary }}
                      >
                        {appointment.meetingReason}
                      </ThemedText>
                    </View>

                    <ThemedText
                      type="small"
                      style={[styles.submittedDate, { color: theme.textSecondary }]}
                    >
                      Submitted: {formatDate(appointment.createdAt)}
                    </ThemedText>
                  </View>
                </Animated.View>
              ))
            ) : (
              <View
                style={[
                  styles.emptyCard,
                  {
                    backgroundColor: theme.backgroundDefault,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Image
                  source={require("../../assets/images/empty-appointments.png")}
                  style={styles.emptyImage}
                  resizeMode="contain"
                />
                <ThemedText type="h4" style={styles.emptyTitle}>
                  No Appointments Found
                </ThemedText>
                <ThemedText
                  type="body"
                  style={[styles.emptyText, { color: theme.textSecondary }]}
                >
                  No appointment found with this email address. You can submit a
                  new request from the Home tab.
                </ThemedText>
              </View>
            )}
          </Animated.View>
        ) : null}
      </ScrollView>
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
  heroSection: {
    marginBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    lineHeight: 24,
  },
  searchCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.xs,
    fontWeight: "500",
  },
  searchRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  searchButton: {
    marginTop: Spacing.sm,
  },
  errorText: {
    marginTop: Spacing.xs,
  },
  resultCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 11,
  },
  resultDetails: {
    gap: Spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  approvedInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    gap: Spacing.md,
    marginVertical: Spacing.sm,
  },
  approvedDetails: {
    flex: 1,
    gap: Spacing.xs,
  },
  reasonSection: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  submittedDate: {
    marginTop: Spacing.sm,
  },
  emptyCard: {
    padding: Spacing["3xl"],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    lineHeight: 22,
  },
});
