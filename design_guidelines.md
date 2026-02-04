# Dean Appointment Scheduling - Design Guidelines

## Brand Identity

**Purpose**: Enable seamless appointment scheduling between students/visitors and the college dean, reducing administrative overhead while maintaining professionalism.

**Aesthetic Direction**: **Refined Academic** - Clean, professional, and trustworthy. Think university website meets modern SaaS dashboard. Uses whitespace generously, clear typography hierarchy, and subtle elevation changes. The design should feel authoritative yet approachable.

**Memorable Element**: A distinctive time slot visualization system with color-coded status indicators that makes the booking process instantly understandable.

---

## Navigation Architecture

**Type**: Multi-page web application with role-based access

**Public Pages**:
- Homepage / Appointment Request
- Check Status (query by email)

**Admin Pages** (password-protected):
- Admin Login
- Dashboard (appointment list)
- Appointment Details
- Schedule View

---

## Screen-by-Screen Specifications

### 1. Homepage / Appointment Request
**Purpose**: Primary entry point for users to submit appointment requests.

**Layout**:
- Fixed navbar: College logo/name (left), "Check Status" link (right)
- Hero section: Page title + brief description of the process
- Main form card (centered, max-width 600px, elevated shadow)
- Footer: Contact info, office hours

**Components**:
- Form with clear field labels above inputs
- Dropdown for "Role" selection
- Date picker for "Preferred Date" (disable past dates)
- Large textarea for "Reason" (minimum 3 rows visible)
- Primary action button: "Submit Request" (full-width within card)
- Success message banner appears above form after submission (green background, check icon)

**Visual Hierarchy**:
- Form card background: Surface color with subtle shadow (4px blur, 0.08 opacity)
- Input fields: 1px border, rounded corners (4px), focus state with primary color border
- Submit button: Bold, prominent, primary color background

---

### 2. Check Status Page
**Purpose**: Allow users to view their appointment status without login.

**Layout**:
- Same navbar as homepage
- Search card (centered, max-width 600px)
- Results card appears below search (if found)

**Components**:
- Email input field + "Search" button
- Status card displays:
  - Applicant name
  - Request date
  - Status badge (Pending: yellow, Approved: green, Rejected: red)
  - If approved: Assigned date + time slot (bold, larger text)
  - Reason submitted (grayed out secondary text)
- "Request Another Appointment" button at bottom

**Empty State**: If no appointment found, show message: "No appointment found with this email address."

---

### 3. Admin Login
**Purpose**: Secure access to admin dashboard.

**Layout**:
- Centered login card (max-width 400px)
- Minimal page: just logo, card, and subtle background

**Components**:
- Username field
- Password field (masked)
- "Login" button (primary color, full-width)
- Error message banner (red) if credentials invalid

---

### 4. Admin Dashboard
**Purpose**: Central hub for dean to manage all appointment requests.

**Layout**:
- Top navbar: "Dean Dashboard" title, logout button (right)
- Filter tabs: All / Pending / Approved / Rejected (sticky below navbar)
- Appointment list: Table or card list (responsive)
- Each row shows: Name, Role, Preferred Date, Status badge, Actions (buttons)

**Components**:
- Action buttons for each pending appointment: "Approve" (green), "Reject" (red)
- Clicking "Approve" opens time slot selector modal
- Status badges: Same color coding as public view
- Search/filter bar above list (optional for viva demo)

**Modal - Assign Time Slot**:
- Displays appointment details at top
- Time slot selector: Dropdown or button grid showing available slots (9AM-5PM, 30-min increments)
- Unavailable slots are grayed out and disabled
- "Confirm & Approve" button (primary), "Cancel" button (secondary)

---

### 5. Schedule View (Admin)
**Purpose**: Calendar overview of dean's daily meetings.

**Layout**:
- Same navbar as dashboard
- Date selector at top (prev/next day arrows + date display)
- Time slot grid: Vertical list of 30-minute blocks (9AM-5PM)
- Each booked slot shows: Time, Name, Role (compact card)
- Empty slots shown with light background

**Visual Design**:
- Booked slots: Primary color tint, white text
- Empty slots: Light gray background, dashed border
- Current time indicator (optional): Red line across grid

---

## Color Palette

**Primary**: #1E3A8A (Deep Navy Blue) - Authority, trust, academia
**Primary Hover**: #1E40AF
**Primary Light**: #DBEAFE (for tinted backgrounds)

**Background**: #F9FAFB (Subtle warm gray)
**Surface**: #FFFFFF (Cards, modals)

**Text Primary**: #111827 (Near black)
**Text Secondary**: #6B7280 (Muted gray)

**Semantic Colors**:
- Success (Approved): #10B981 (Green)
- Warning (Pending): #F59E0B (Amber)
- Error (Rejected): #EF4444 (Red)
- Info: #3B82F6 (Blue)

**Borders**: #E5E7EB (Light gray)

---

## Typography

**Font**: Use system fonts for performance and familiarity:
- Primary: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

**Type Scale**:
- Page Title (H1): 32px, Bold, 1.2 line-height
- Section Heading (H2): 24px, Semibold
- Card Title (H3): 18px, Semibold
- Body: 16px, Regular, 1.5 line-height
- Small/Caption: 14px, Regular, 1.4 line-height
- Button Text: 16px, Semibold

---

## Assets to Generate

1. **logo.png** - College/department logo or text-based "Dean's Office" logo
   - WHERE USED: Navbar on all pages
   
2. **empty-appointments.png** - Simple illustration of a calendar with checkmark
   - WHERE USED: Admin dashboard when no appointments exist

3. **success-icon.svg** - Checkmark in circle
   - WHERE USED: Success message after form submission

4. **calendar-illustration.png** - Abstract calendar/schedule graphic
   - WHERE USED: Hero section on homepage (optional decorative element)

---

## Visual Design Notes

- All interactive elements have `:hover` states (slight darkening for buttons, border color change for inputs)
- Buttons have 8px padding (vertical) and 16px padding (horizontal), 4px border-radius
- Form inputs: 12px padding, 4px border-radius, 1px border
- Cards: 16px padding, 8px border-radius, subtle shadow
- Use consistent spacing scale: 8px, 16px, 24px, 32px, 48px
- Responsive breakpoint: Stack form fields and table rows vertically on screens <768px
- Status badges: 6px padding (horizontal), 4px padding (vertical), 12px font size, UPPERCASE text, 12px border-radius (pill shape)