# Dean Appointment & Meeting Scheduling Application

## Overview
A mobile-responsive appointment scheduling application that allows users (students, parents, visitors, staff) to request meetings with the college dean. Features both a public interface for appointment requests and an admin dashboard for the dean to manage appointments.

## Current State
The application is fully functional with the following features implemented:

### User Features
- Public homepage with appointment request form
- Form fields: Name, Role, Email, Phone, Reason, Preferred Date
- Check appointment status by email (no login required)
- View approved date and assigned time slot

### Admin Features
- Secure admin login (credentials: admin / admin123)
- Dashboard to view all appointment requests
- Filter by status (All/Pending/Approved/Rejected)
- Approve or reject requests
- Assign available time slots with double-booking prevention
- View daily schedule with time slot grid

## Tech Stack
- **Frontend**: React Native with Expo
- **Backend**: Express.js with TypeScript
- **Storage**: In-memory storage (MemStorage)
- **UI**: Custom components following design guidelines

## Project Structure
```
client/
├── App.tsx                    # Root component with providers
├── components/                # Reusable UI components
├── constants/theme.ts         # Colors, spacing, typography
├── hooks/                     # Custom hooks
├── lib/query-client.ts        # API client configuration
├── navigation/                # Navigation setup
│   ├── RootStackNavigator.tsx
│   ├── MainTabNavigator.tsx
│   ├── HomeStackNavigator.tsx
│   ├── StatusStackNavigator.tsx
│   ├── ScheduleStackNavigator.tsx
│   └── ProfileStackNavigator.tsx
└── screens/                   # Screen components
    ├── HomeScreen.tsx         # Appointment request form
    ├── CheckStatusScreen.tsx  # Status lookup
    ├── ScheduleViewScreen.tsx # Daily schedule view
    ├── ProfileScreen.tsx      # App info & admin access
    ├── AdminLoginScreen.tsx   # Admin login
    └── AdminDashboardScreen.tsx # Admin dashboard

server/
├── index.ts                   # Express server setup
├── routes.ts                  # API endpoints
└── storage.ts                 # In-memory data storage

shared/
└── schema.ts                  # Type definitions and validation schemas
```

## API Endpoints
- `GET /api/appointments` - List all appointments
- `POST /api/appointments` - Create new appointment
- `PATCH /api/appointments/:id` - Update appointment status
- `GET /api/appointments/search?email=` - Search by email
- `GET /api/appointments/booked-slots` - Get booked time slots
- `POST /api/admin/login` - Admin authentication

## Design System
- **Primary Color**: #1E3A8A (Deep Navy Blue)
- **Success**: #10B981 (Green)
- **Warning**: #F59E0B (Amber)
- **Error**: #EF4444 (Red)
- **Font**: System fonts for native feel

## Running the App
- Frontend runs on port 8081 (Expo dev server)
- Backend runs on port 5000 (Express server)
- Users can scan QR code to test on physical devices via Expo Go

## Default Admin Credentials
- Username: admin
- Password: admin123
