import React, { useState } from "react";
import {
  View,
  StyleSheet,
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
import { useQuery } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { timeSlotOptions, type Appointment } from "@shared/schema";

export default function ScheduleViewScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const approvedAppointments = appointments.filter(
    (apt) => apt.status === "Approved" && apt.preferredDate === selectedDate
  );

  const getAppointmentForSlot = (slot: string) => {
    return approvedAppointments.find((apt) => apt.timeSlot === slot);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const navigateDate = (direction: "prev" | "next") => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + (direction === "next" ? 1 : -1));
    setSelectedDate(current.toISOString().split("T")[0]);
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: tabBarHeight + Spacing["3xl"],
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.dateNavigator,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.border,
            },
          ]}
        >
          <Pressable
            style={[styles.navButton, { backgroundColor: theme.backgroundSecondary }]}
            onPress={() => navigateDate("prev")}
          >
            <Feather name="chevron-left" size={24} color={theme.text} />
          </Pressable>

          <Pressable onPress={goToToday} style={styles.dateDisplay}>
            <ThemedText type="h4" style={styles.dateText}>
              {formatDate(selectedDate)}
            </ThemedText>
            {isToday ? (
              <View style={[styles.todayBadge, { backgroundColor: theme.link }]}>
                <ThemedText type="small" style={styles.todayText}>
                  Today
                </ThemedText>
              </View>
            ) : null}
          </Pressable>

          <Pressable
            style={[styles.navButton, { backgroundColor: theme.backgroundSecondary }]}
            onPress={() => navigateDate("next")}
          >
            <Feather name="chevron-right" size={24} color={theme.text} />
          </Pressable>
        </View>

        <View style={styles.scheduleGrid}>
          {timeSlotOptions.map((slot, index) => {
            const appointment = getAppointmentForSlot(slot);
            const isBooked = !!appointment;

            return (
              <Animated.View
                key={slot}
                entering={FadeInDown.delay(30 * index).duration(300)}
                style={[
                  styles.timeSlot,
                  {
                    backgroundColor: isBooked
                      ? theme.primaryLight
                      : theme.backgroundDefault,
                    borderColor: isBooked ? theme.link : theme.border,
                    borderStyle: isBooked ? "solid" : "dashed",
                  },
                ]}
              >
                <View style={styles.slotTime}>
                  <Feather
                    name="clock"
                    size={16}
                    color={isBooked ? theme.link : theme.textSecondary}
                  />
                  <ThemedText
                    type="body"
                    style={{
                      fontWeight: "600",
                      color: isBooked ? theme.link : theme.text,
                    }}
                  >
                    {slot}
                  </ThemedText>
                </View>

                {isBooked && appointment ? (
                  <View style={styles.appointmentInfo}>
                    <View style={styles.appointmentHeader}>
                      <ThemedText type="h4">{appointment.name}</ThemedText>
                      <View
                        style={[
                          styles.roleBadge,
                          { backgroundColor: theme.backgroundSecondary },
                        ]}
                      >
                        <ThemedText type="small">{appointment.role}</ThemedText>
                      </View>
                    </View>
                    <ThemedText
                      type="small"
                      style={{ color: theme.textSecondary }}
                      numberOfLines={2}
                    >
                      {appointment.meetingReason}
                    </ThemedText>
                  </View>
                ) : (
                  <View style={styles.emptySlot}>
                    <ThemedText
                      type="small"
                      style={{ color: theme.textSecondary }}
                    >
                      Available
                    </ThemedText>
                  </View>
                )}
              </Animated.View>
            );
          })}
        </View>

        {approvedAppointments.length === 0 ? (
          <View style={styles.noMeetingsContainer}>
            <Image
              source={require("../../assets/images/empty-appointments.png")}
              style={styles.noMeetingsImage}
              resizeMode="contain"
            />
            <ThemedText type="h4" style={styles.noMeetingsTitle}>
              No Meetings Scheduled
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.noMeetingsText, { color: theme.textSecondary }]}
            >
              There are no approved appointments for this date.
            </ThemedText>
          </View>
        ) : null}

        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.border,
            },
          ]}
        >
          <ThemedText type="h4" style={styles.summaryTitle}>
            Daily Summary
          </ThemedText>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <ThemedText type="h2" style={{ color: theme.link }}>
                {approvedAppointments.length}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Meetings
              </ThemedText>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <ThemedText type="h2" style={{ color: theme.success }}>
                {timeSlotOptions.length - approvedAppointments.length}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Available Slots
              </ThemedText>
            </View>
          </View>
        </View>
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
  dateNavigator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  dateDisplay: {
    flex: 1,
    alignItems: "center",
  },
  dateText: {
    textAlign: "center",
  },
  todayBadge: {
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  todayText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 11,
  },
  scheduleGrid: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  timeSlot: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    minHeight: 70,
  },
  slotTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    width: 100,
  },
  appointmentInfo: {
    flex: 1,
    paddingLeft: Spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: "rgba(0,0,0,0.1)",
    gap: Spacing.xs,
  },
  appointmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  emptySlot: {
    flex: 1,
    justifyContent: "center",
    paddingLeft: Spacing.md,
  },
  noMeetingsContainer: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  noMeetingsImage: {
    width: 100,
    height: 100,
    marginBottom: Spacing.lg,
    opacity: 0.6,
  },
  noMeetingsTitle: {
    marginBottom: Spacing.sm,
  },
  noMeetingsText: {
    textAlign: "center",
  },
  summaryCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  summaryTitle: {
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    height: 50,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginHorizontal: Spacing.xl,
  },
});
