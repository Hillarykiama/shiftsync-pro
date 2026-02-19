import { supabase } from './supabase'

// ─── IP ADDRESS ───────────────────────────────────────────
async function getIPAddress() {
  try {
    const res = await fetch('https://api.ipify.org?format=json')
    const data = await res.json()
    return data.ip
  } catch {
    return 'Unknown'
  }
}

// ─── EMPLOYEES ────────────────────────────────────────────
export async function getEmployees() {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('name')
  if (error) console.error('getEmployees error:', error)
  return data || []
}

// ─── ATTENDANCE ───────────────────────────────────────────
export async function getTodayAttendance() {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('attendance')
    .select(`
      *,
      employees (
        id, name, role, department,
        avatar, shift_start, shift_end
      )
    `)
    .eq('date', today)
  if (error) console.error('getTodayAttendance error:', error)
  return data || []
}

export async function clockIn(employeeId) {
  const today = new Date().toISOString().split('T')[0]
  const ip = await getIPAddress()

  const { data: existing } = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('date', today)
    .single()

  if (existing) {
    const { data, error } = await supabase
      .from('attendance')
      .update({
        status: 'clocked-in',
        clock_in: new Date().toISOString(),
        method: 'facial-recognition',
        location: 'HQ · Floor 3',
        ip_address: ip,
      })
      .eq('id', existing.id)
      .select()
    if (error) console.error('clockIn update error:', error)
    return data
  } else {
    const { data, error } = await supabase
      .from('attendance')
      .insert({
        employee_id: employeeId,
        status: 'clocked-in',
        clock_in: new Date().toISOString(),
        date: today,
        method: 'facial-recognition',
        location: 'HQ · Floor 3',
        ip_address: ip,
      })
      .select()
    if (error) console.error('clockIn insert error:', error)
    return data
  }
}

export async function clockOut(employeeId) {
  const today = new Date().toISOString().split('T')[0]
  const clockOutTime = new Date()

  const { data: existing } = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('date', today)
    .single()

  if (!existing) return null

  const clockInTime = new Date(existing.clock_in)
  const hoursToday = parseFloat(
    ((clockOutTime - clockInTime) / (1000 * 60 * 60)).toFixed(2)
  )
  const overtime = parseFloat(Math.max(0, hoursToday - 8).toFixed(2))

  const { data, error } = await supabase
    .from('attendance')
    .update({
      status: 'clocked-out',
      clock_out: clockOutTime.toISOString(),
      hours_today: hoursToday,
      overtime,
    })
    .eq('id', existing.id)
    .select()

  if (error) console.error('clockOut error:', error)
  return data
}

// ─── SHIFTS ───────────────────────────────────────────────
export async function getShifts() {
  const { data, error } = await supabase
    .from('shifts')
    .select(`
      *,
      employee:employee_id ( name, avatar ),
      swap_with:swap_with_id ( name, avatar )
    `)
    .order('created_at', { ascending: false })
  if (error) console.error('getShifts error:', error)
  return data || []
}

export async function createShiftSwap({ employeeId, swapWithId, date, shift, reason }) {
  const { data, error } = await supabase
    .from('shifts')
    .insert({
      employee_id: employeeId,
      swap_with_id: swapWithId,
      shift_date: date,
      shift_time: shift,
      reason,
      status: 'pending',
    })
    .select()
  if (error) console.error('createShiftSwap error:', error)
  return data
}

export async function updateShiftStatus(id, status) {
  const { data, error } = await supabase
    .from('shifts')
    .update({ status })
    .eq('id', id)
    .select()
  if (error) console.error('updateShiftStatus error:', error)
  return data
}

// ─── LEAVES ───────────────────────────────────────────────
export async function getLeaves() {
  const { data, error } = await supabase
    .from('leaves')
    .select(`
      *,
      employees ( name, avatar )
    `)
    .order('created_at', { ascending: false })
  if (error) console.error('getLeaves error:', error)
  return data || []
}

export async function createLeave({ employeeId, type, fromDate, toDate, days, reason }) {
  const { data, error } = await supabase
    .from('leaves')
    .insert({
      employee_id: employeeId,
      type,
      from_date: fromDate,
      to_date: toDate,
      days,
      reason,
      status: 'pending',
    })
    .select()
  if (error) console.error('createLeave error:', error)
  return data
}

export async function updateLeaveStatus(id, status) {
  const { data, error } = await supabase
    .from('leaves')
    .update({ status })
    .eq('id', id)
    .select()
  if (error) console.error('updateLeaveStatus error:', error)
  return data
}