import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  FlatList,
  Modal,
  Image,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import { timeSlotOptions, type Appointment, type Status } from "@shared/schema";

type FilterTab = "All" | Status;

export default function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  const { data: appointments = [], isLoading, refetch } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const { data: bookedSlots = [] } = useQuery<{ date: string; timeSlot: string }[]>({
    queryKey: ["/api/appointments/booked-slots", selectedAppointment?.preferredDate],
    enabled: !!selectedAppointment,
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      timeSlot,
    }: {
      id: string;
      status: Status;
      timeSlot: string | null;
    }) => {
      const response = await apiRequest("PATCH", `/api/appointments/${id}`, {
        status,
        timeSlot,
      });
      return response.json();
    },
    onSuccess: () => {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setShowTimeSlotModal(false);
      setSelectedAppointment(null);
      setSelectedTimeSlot(null);
    },
  });

  const filteredAppointments = appointments.filter((apt) => {
    if (activeFilter === "All") return true;
    return apt.status === activeFilter;
  });

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
      month: "short",
      day: "numeric",
    });
  };

  const handleApprove = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedTimeSlot(null);
    setShowTimeSlotModal(true);
  };

  const handleReject = (appointment: Appointment) => {
    updateMutation.mutate({
      id: appointment.id,
      status: "Rejected",
      timeSlot: null,
    });
  };

  const handleConfirmApproval = () => {
    if (selectedAppointment && selectedTimeSlot) {
      updateMutation.mutate({
        id: selectedAppointment.id,
        status: "Approved",
        timeSlot: selectedTimeSlot,
      });
    }
  };

  const isSlotBooked = (slot: string) => {
    return bookedSlots.some(
      (booked) =>
        booked.date === selectedAppointment?.preferredDate &&
        booked.timeSlot === slot
    );
  };

  const filterTabs: FilterTab[] = ["All", "Pending", "Approved", "Rejected"];

  const renderAppointmentCard = ({ item, index }: { item: Appointment; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(50 * index).duration(300)}
      style={[
        styles.appointmentCard,
        {
          backgroundColor: theme.backgroundDefault,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <ThemedText type="h4">{item.name}</ThemedText>
          <View style={styles.roleRow}>
            <Feather name="user" size={14} color={theme.textSecondary} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {item.role}
            </ThemedText>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <ThemedText type="small" style={styles.statusText}>
            {item.status.toUpperCase()}
          </ThemedText>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Feather name="mail" size={14} color={theme.textSecondary} />
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {item.email}
          </ThemedText>
        </View>
        <View style={styles.detailRow}>
          <Feather name="phone" size={14} color={theme.textSecondary} />
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {item.phone}
          </ThemedText>
        </View>
        <View style={styles.detailRow}>
          <Feather name="calendar" size={14} color={theme.textSecondary} />
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Preferred: {formatDate(item.preferredDate)}
          </ThemedText>
        </View>
        {item.timeSlot ? (
          <View style={styles.detailRow}>
            <Feather name="clock" size={14} color={getStatusColor("Approved")} />
            <ThemedText type="small" style={{ color: getStatusColor("Approved"), fontWeight: "600" }}>
              Assigned: {item.timeSlot}
            </ThemedText>
          </View>
        ) : null}
      </View>

      <View style={styles.reasonSection}>
        <ThemedText type="small" style={{ color: theme.textSecondary, fontWeight: "500" }}>
          Reason:
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {item.meetingReason}
        </ThemedText>
      </View>

      {item.status === "Pending" ? (
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApprove(item)}
          >
            <Feather name="check" size={16} color="#FFFFFF" />
            <ThemedText type="small" style={styles.actionButtonText}>
              Approve
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.actionButton,
              styles.rejectButton,
              { backgroundColor: theme.error },
            ]}
            onPress={() => handleReject(item)}
          >
            <Feather name="x" size={16} color="#FFFFFF" />
            <ThemedText type="small" style={styles.actionButtonText}>
              Reject
            </ThemedText>
          </Pressable>
        </View>
      ) : null}
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={require("../../assets/images/empty-appointments.png")}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <ThemedText type="h4" style={styles.emptyTitle}>
        No Appointments
      </ThemedText>
      <ThemedText
        type="body"
        style={[styles.emptyText, { color: theme.textSecondary }]}
      >
        {activeFilter === "All"
          ? "No appointment requests yet."
          : `No ${activeFilter.toLowerCase()} appointments.`}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.filterTabs, { marginTop: headerHeight + Spacing.sm }]}>
        {filterTabs.map((tab) => (
          <Pressable
            key={tab}
            style={[
              styles.filterTab,
              {
                backgroundColor:
                  activeFilter === tab ? theme.link : theme.backgroundSecondary,
              },
            ]}
            onPress={() => {
              setActiveFilter(tab);
              if (Platform.OS !== "web") {
                Haptics.selectionAsync();
              }
            }}
          >
            <ThemedText
              type="small"
              style={{
                color: activeFilter === tab ? "#FFFFFF" : theme.textSecondary,
                fontWeight: "600",
              }}
            >
              {tab}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredAppointments}
        renderItem={renderAppointmentCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing["3xl"] },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={theme.link}
          />
        }
      />

      <Modal
        visible={showTimeSlotModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTimeSlotModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            entering={FadeIn.duration(200)}
            style={[
              styles.modalContainer,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="h3">Assign Time Slot</ThemedText>
              <Pressable onPress={() => setShowTimeSlotModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            {selectedAppointment ? (
              <View style={styles.modalAppointmentInfo}>
                <ThemedText type="h4">{selectedAppointment.name}</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {formatDate(selectedAppointment.preferredDate)}
                </ThemedText>
              </View>
            ) : null}

            <ThemedText type="small" style={styles.slotLabel}>
              Select an available time slot:
            </ThemedText>

            <View style={styles.slotsGrid}>
              {timeSlotOptions.map((slot) => {
                const booked = isSlotBooked(slot);
                const selected = selectedTimeSlot === slot;
                return (
                  <Pressable
                    key={slot}
                    style={[
                      styles.slotButton,
                      {
                        backgroundColor: selected
                          ? theme.link
                          : booked
                          ? theme.backgroundTertiary
                          : theme.backgroundSecondary,
                        borderColor: selected ? theme.link : theme.border,
                        opacity: booked ? 0.5 : 1,
                      },
                    ]}
                    onPress={() => {
                      if (!booked) {
                        setSelectedTimeSlot(slot);
                        if (Platform.OS !== "web") {
                          Haptics.selectionAsync();
                        }
                      }
                    }}
                    disabled={booked}
                  >
                    <ThemedText
                      type="small"
                      style={{
                        color: selected ? "#FFFFFF" : booked ? theme.textSecondary : theme.text,
                        fontWeight: "500",
                      }}
                    >
                      {slot}
                    </ThemedText>
                    {booked ? (
                      <ThemedText
                        type="small"
                        style={{ color: theme.textSecondary, fontSize: 10 }}
                      >
                        Booked
                      </ThemedText>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
                onPress={() => setShowTimeSlotModal(false)}
              >
                <ThemedText type="body">Cancel</ThemedText>
              </Pressable>
              <Button
                onPress={handleConfirmApproval}
                disabled={!selectedTimeSlot || updateMutation.isPending}
                style={styles.confirmButton}
              >
                {updateMutation.isPending ? "Confirming..." : "Confirm & Approve"}
              </Button>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterTabs: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  appointmentCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 10,
  },
  cardDetails: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  reasonSection: {
    padding: Spacing.md,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: BorderRadius.xs,
    gap: Spacing.xs,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  approveButton: {
    backgroundColor: "#10B981",
  },
  rejectButton: {},
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalAppointmentInfo: {
    marginBottom: Spacing.lg,
  },
  slotLabel: {
    marginBottom: Spacing.md,
    fontWeight: "500",
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  slotButton: {
    width: "30%",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  confirmButton: {
    flex: 2,
  },
});
