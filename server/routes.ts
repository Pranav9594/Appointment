import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { createAppointmentSchema, updateAppointmentSchema, loginSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.get("/api/appointments", async (_req: Request, res: Response) => {
    try {
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get("/api/appointments/search", async (req: Request, res: Response) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const appointments = await storage.getAppointmentsByEmail(email);
      if (appointments.length === 0) {
        return res.json({ found: false, appointments: [] });
      }
      res.json({ found: true, appointments });
    } catch (error) {
      res.status(500).json({ message: "Failed to search appointments" });
    }
  });

  app.get("/api/appointments/booked-slots", async (req: Request, res: Response) => {
    try {
      const date = req.query.date as string;
      if (!date) {
        const appointments = await storage.getAppointments();
        const bookedSlots = appointments
          .filter((apt) => apt.status === "Approved" && apt.timeSlot)
          .map((apt) => ({ date: apt.preferredDate, timeSlot: apt.timeSlot! }));
        return res.json(bookedSlots);
      }
      const slots = await storage.getBookedSlots(date);
      res.json(slots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch booked slots" });
    }
  });

  app.post("/api/appointments", async (req: Request, res: Response) => {
    try {
      const result = createAppointmentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: result.error.errors[0]?.message || "Invalid input" 
        });
      }

      const appointment = await storage.createAppointment(result.data);
      res.status(201).json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.patch("/api/appointments/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = updateAppointmentSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: result.error.errors[0]?.message || "Invalid input" 
        });
      }

      if (result.data.status === "Approved" && result.data.timeSlot) {
        const existing = await storage.getAppointmentById(id);
        if (existing) {
          const bookedSlots = await storage.getBookedSlots(existing.preferredDate);
          const isSlotTaken = bookedSlots.some(
            (slot) => slot.timeSlot === result.data.timeSlot
          );
          if (isSlotTaken) {
            return res.status(400).json({ 
              message: "This time slot is already booked" 
            });
          }
        }
      }

      const updated = await storage.updateAppointment(id, result.data);
      if (!updated) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  app.post("/api/admin/login", async (req: Request, res: Response) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: result.error.errors[0]?.message || "Invalid input" 
        });
      }

      const admin = await storage.getAdmin(result.data.username);
      if (!admin || admin.password !== result.data.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ 
        success: true, 
        admin: { id: admin.id, username: admin.username } 
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
