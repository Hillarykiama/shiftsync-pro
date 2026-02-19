export const mockEmployees = [
  { id: 1, name: "Sarah Chen", role: "Engineer", dept: "Engineering", avatar: "SC", shift: "09:00–17:00", status: "clocked-in", clockIn: "08:57", hoursToday: 7.2, weekHours: 38.5, overtime: 2.5 },
  { id: 2, name: "Marcus Reid", role: "Designer", dept: "Product", avatar: "MR", shift: "10:00–18:00", status: "on-break", clockIn: "09:58", hoursToday: 6.1, weekHours: 36.0, overtime: 0 },
  { id: 3, name: "Aisha Patel", role: "PM", dept: "Product", avatar: "AP", shift: "08:00–16:00", status: "clocked-out", clockIn: "08:02", hoursToday: 8.0, weekHours: 40.2, overtime: 0.2 },
  { id: 4, name: "Tom Kowalski", role: "DevOps", dept: "Engineering", avatar: "TK", shift: "07:00–15:00", status: "absent", clockIn: null, hoursToday: 0, weekHours: 32.0, overtime: 0 },
  { id: 5, name: "Lena Müller", role: "Analyst", dept: "Finance", avatar: "LM", shift: "09:00–17:00", status: "clocked-in", clockIn: "09:15", hoursToday: 6.8, weekHours: 39.1, overtime: 1.1 },
  { id: 6, name: "James Okafor", role: "Engineer", dept: "Engineering", avatar: "JO", shift: "09:00–17:00", status: "clocked-in", clockIn: "08:50", hoursToday: 7.4, weekHours: 41.0, overtime: 3.0 },
];

export const mockShifts = [
  { id: 1, employee: "Sarah Chen", from: "Marcus Reid", date: "2026-02-21", shift: "09:00–17:00", status: "pending", reason: "Medical appointment" },
  { id: 2, employee: "Tom Kowalski", from: "James Okafor", date: "2026-02-20", shift: "07:00–15:00", status: "approved", reason: "Family event" },
  { id: 3, employee: "Lena Müller", from: "Aisha Patel", date: "2026-02-23", shift: "09:00–17:00", status: "pending", reason: "Personal commitment" },
];

export const mockLeaves = [
  { id: 1, employee: "Sarah Chen", type: "Annual Leave", from: "2026-02-25", to: "2026-02-28", days: 4, status: "pending", reason: "Vacation" },
  { id: 2, employee: "Marcus Reid", type: "Sick Leave", from: "2026-02-19", to: "2026-02-19", days: 1, status: "approved", reason: "Unwell" },
  { id: 3, employee: "Tom Kowalski", type: "Emergency Leave", from: "2026-02-19", to: "2026-02-20", days: 2, status: "pending", reason: "Family emergency" },
];

export const weekData = [
  { day: "Mon", present: 48, absent: 4, late: 3 },
  { day: "Tue", present: 51, absent: 2, late: 2 },
  { day: "Wed", present: 46, absent: 6, late: 5 },
  { day: "Thu", present: 50, absent: 3, late: 4 },
  { day: "Fri", present: 44, absent: 7, late: 6 },
  { day: "Sat", present: 18, absent: 0, late: 1 },
  { day: "Sun", present: 12, absent: 0, late: 0 },
];

export const currentUser = {
  name: "Sarah Chen",
  role: "Employee",
  avatar: "SC",
};