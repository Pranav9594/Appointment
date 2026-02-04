import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useMutation } from "@tanstack/react-query";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import { roleOptions, type Role } from "@shared/schema";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();

  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("Student");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createAppointment = useMutation({
    mutationFn: async (data: {
      name: string;
      role: Role;
      email: string;
      phone: string;
      meetingReason: string;
      preferredDate: string;
    }) => {
      const response = await apiRequest("POST", "/api/appointments", data);
      return response.json();
    },
    onSuccess: () => {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setShowSuccess(true);
      resetForm();
      setTimeout(() => setShowSuccess(false), 5000);
    },
    onError: (error: Error) => {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      setErrors({ submit: error.message });
    },
  });

  const resetForm = () => {
    setName("");
    setRole("Student");
    setEmail("");
    setPhone("");
    setReason("");
    setPreferredDate("");
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (!email.includes("@")) {
      newErrors.email = "Please enter a valid email";
    }
    if (phone.length < 10) {
      newErrors.phone = "Phone must be at least 10 digits";
    }
    if (reason.length < 10) {
      newErrors.reason = "Please provide more details";
    }
    if (!preferredDate) {
      newErrors.preferredDate = "Please select a date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      createAppointment.mutate({
        name,
        role,
        email,
        phone,
        meetingReason: reason,
        preferredDate,
      });
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
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
              Request an Appointment
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.subtitle, { color: theme.textSecondary }]}
            >
              Schedule a meeting with the Dean's Office. Fill out the form below
              and we'll get back to you with a confirmed time slot.
            </ThemedText>
          </View>
        </Animated.View>

        {showSuccess ? (
          <Animated.View
            entering={FadeInUp.duration(400)}
            style={[
              styles.successBanner,
              { backgroundColor: isDark ? Colors.dark.success : Colors.light.success },
            ]}
          >
            <Feather name="check-circle" size={24} color="#FFFFFF" />
            <ThemedText type="body" style={styles.successText}>
              Appointment request submitted successfully!
            </ThemedText>
          </Animated.View>
        ) : null}

        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={[
            styles.formCard,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              Full Name
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                  borderColor: errors.name ? theme.error : theme.border,
                },
              ]}
              placeholder="Enter your full name"
              placeholderTextColor={theme.textSecondary}
              value={name}
              onChangeText={setName}
              testID="input-name"
            />
            {errors.name ? (
              <ThemedText type="small" style={[styles.errorText, { color: theme.error }]}>
                {errors.name}
              </ThemedText>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              Role
            </ThemedText>
            <Pressable
              style={[
                styles.input,
                styles.picker,
                {
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => setShowRolePicker(!showRolePicker)}
              testID="picker-role"
            >
              <ThemedText type="body">{role}</ThemedText>
              <Feather
                name={showRolePicker ? "chevron-up" : "chevron-down"}
                size={20}
                color={theme.textSecondary}
              />
            </Pressable>
            {showRolePicker ? (
              <View
                style={[
                  styles.pickerOptions,
                  {
                    backgroundColor: theme.backgroundDefault,
                    borderColor: theme.border,
                  },
                ]}
              >
                {roleOptions.map((option) => (
                  <Pressable
                    key={option}
                    style={[
                      styles.pickerOption,
                      role === option && {
                        backgroundColor: theme.primaryLight,
                      },
                    ]}
                    onPress={() => {
                      setRole(option);
                      setShowRolePicker(false);
                      if (Platform.OS !== "web") {
                        Haptics.selectionAsync();
                      }
                    }}
                  >
                    <ThemedText type="body">{option}</ThemedText>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              Email
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                  borderColor: errors.email ? theme.error : theme.border,
                },
              ]}
              placeholder="your.email@example.com"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              testID="input-email"
            />
            {errors.email ? (
              <ThemedText type="small" style={[styles.errorText, { color: theme.error }]}>
                {errors.email}
              </ThemedText>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              Phone Number
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                  borderColor: errors.phone ? theme.error : theme.border,
                },
              ]}
              placeholder="Enter your phone number"
              placeholderTextColor={theme.textSecondary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              testID="input-phone"
            />
            {errors.phone ? (
              <ThemedText type="small" style={[styles.errorText, { color: theme.error }]}>
                {errors.phone}
              </ThemedText>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              Preferred Date
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                  borderColor: errors.preferredDate ? theme.error : theme.border,
                },
              ]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.textSecondary}
              value={preferredDate}
              onChangeText={setPreferredDate}
              testID="input-date"
            />
            {errors.preferredDate ? (
              <ThemedText type="small" style={[styles.errorText, { color: theme.error }]}>
                {errors.preferredDate}
              </ThemedText>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              Reason for Appointment
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                  borderColor: errors.reason ? theme.error : theme.border,
                },
              ]}
              placeholder="Please describe the purpose of your meeting..."
              placeholderTextColor={theme.textSecondary}
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              testID="input-reason"
            />
            {errors.reason ? (
              <ThemedText type="small" style={[styles.errorText, { color: theme.error }]}>
                {errors.reason}
              </ThemedText>
            ) : null}
          </View>

          {errors.submit ? (
            <View style={[styles.errorBanner, { backgroundColor: theme.error + "20" }]}>
              <Feather name="alert-circle" size={16} color={theme.error} />
              <ThemedText type="small" style={{ color: theme.error }}>
                {errors.submit}
              </ThemedText>
            </View>
          ) : null}

          <Button
            onPress={handleSubmit}
            disabled={createAppointment.isPending}
            style={styles.submitButton}
          >
            {createAppointment.isPending ? "Submitting..." : "Submit Request"}
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
            Office Hours: Monday - Friday, 9:00 AM - 5:00 PM
          </ThemedText>
          <ThemedText
            type="small"
            style={[styles.footerText, { color: theme.textSecondary }]}
          >
            Contact: dean.office@college.edu
          </ThemedText>
        </Animated.View>
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
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  successText: {
    color: "#FFFFFF",
    flex: 1,
  },
  formCard: {
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
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  picker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerOptions: {
    marginTop: Spacing.xs,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    overflow: "hidden",
  },
  pickerOption: {
    padding: Spacing.md,
  },
  errorText: {
    marginTop: Spacing.xs,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
  footer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  footerText: {
    marginBottom: Spacing.xs,
  },
});
