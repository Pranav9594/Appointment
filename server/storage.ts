import { randomUUID } from "crypto";
import type { Appointment, Admin, Status } from "@shared/schema";

export interface IStorage {
  getAppointments(): Promise<Appointment[]>;
  getAppointmentById(id: string): Promise<Appointment | undefined>;
  getAppointmentsByEmail(email: string): Promise<Appointment[]>;
  createAppointment(data: Omit<Appointment, "id" | "createdAt" | "status" | "timeSlot">): Promise<Appointment>;
  updateAppointment(id: string, data: { status: Status; timeSlot: string | null }): Promise<Appointment | undefined>;
  getBookedSlots(date: string): Promise<{ date: string; timeSlot: string }[]>;
  getAdmin(username: string): Promise<Admin | undefined>;
}

export class MemStorage implements IStorage {
  private appointments: Map<string, Appointment>;
  private admins: Map<string, Admin>;

  constructor() {
    this.appointments = new Map();
    this.admins = new Map();
    
    const defaultAdmin: Admin = {
      id: randomUUID(),
      username: "admin",
      password: "admin123",
    };
    this.admins.set(defaultAdmin.username, defaultAdmin);
  }

  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getAppointmentById(id: string): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointmentsByEmail(email: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter((apt) => apt.email.toLowerCase() === email.toLowerCase())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createAppointment(
    data: Omit<Appointment, "id" | "createdAt" | "status" | "timeSlot">
  ): Promise<Appointment> {
    const id = randomUUID();
    const appointment: Appointment = {
      ...data,
      id,
      status: "Pending",
      timeSlot: null,
      createdAt: new Date().toISOString(),
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(
    id: string,
    data: { status: Status; timeSlot: string | null }
  ): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;

    const updated: Appointment = {
      ...appointment,
      status: data.status,
      timeSlot: data.timeSlot,
    };
    this.appointments.set(id, updated);
    return updated;
  }

  async getBookedSlots(date: string): Promise<{ date: string; timeSlot: string }[]> {
    return Array.from(this.appointments.values())
      .filter(
        (apt) =>
          apt.status === "Approved" &&
          apt.preferredDate === date &&
          apt.timeSlot !== null
      )
      .map((apt) => ({
        date: apt.preferredDate,
        timeSlot: apt.timeSlot!,
      }));
  }

  async getAdmin(username: string): Promise<Admin | undefined> {
    return this.admins.get(username);
  }
}

export const storage = new MemStorage();
