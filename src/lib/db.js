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

  const { data: existing } = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('date', today)
    .single()

  if (!existing || !existing.clock_in) return null

  const clockOutTime = new Date().toISOString()
  const result = await calculateAndSaveOvertime(
    employeeId,
    existing.clock_in,
    clockOutTime
  )

  return result
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

// ─── ANALYTICS ────────────────────────────────────────────
export async function getAttendanceAnalytics() {
  const { data, error } = await supabase
    .from('attendance')
    .select(`
      *,
      employees ( name, department )
    `)
    .order('date', { ascending: false })
  if (error) console.error('getAttendanceAnalytics error:', error)
  return data || []
}

export async function getWeeklyAttendance() {
  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6)

  const { data, error } = await supabase
    .from('attendance')
    .select('date, status, employee_id')
    .gte('date', sevenDaysAgo.toISOString().split('T')[0])
    .lte('date', today.toISOString().split('T')[0])
  if (error) console.error('getWeeklyAttendance error:', error)
  return data || []
}

// ─── OVERTIME ─────────────────────────────────────────────
export async function getOvertimeRules() {
  const { data, error } = await supabase
    .from('overtime_rules')
    .select('*')
    .single()
  if (error) console.error('getOvertimeRules error:', error)
  return data || {
    daily_threshold: 8,
    weekly_threshold: 40,
    rate_multiplier: 1.5,
    double_time_threshold: 12,
    double_time_multiplier: 2.0,
  }
}

export async function getWeeklyHours(employeeId) {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - today.getDay() + 1)

  const { data, error } = await supabase
    .from('attendance')
    .select('hours_today, date')
    .eq('employee_id', employeeId)
    .gte('date', monday.toISOString().split('T')[0])
    .lte('date', today.toISOString().split('T')[0])
  if (error) console.error('getWeeklyHours error:', error)

  const total = (data || []).reduce((sum, r) => sum + (r.hours_today || 0), 0)
  return parseFloat(total.toFixed(2))
}

export async function calculateAndSaveOvertime(employeeId, clockInTime, clockOutTime) {
  const rules = await getOvertimeRules()
  const weeklyHours = await getWeeklyHours(employeeId)

  const clockIn  = new Date(clockInTime)
  const clockOut = new Date(clockOutTime)
  const totalHours = parseFloat(
    ((clockOut - clockIn) / (1000 * 60 * 60)).toFixed(2)
  )

  // Daily overtime calculation
  let regularHours    = 0
  let overtimeHours   = 0
  let doubleTimeHours = 0

  if (totalHours <= rules.daily_threshold) {
    regularHours = totalHours
  } else if (totalHours <= rules.double_time_threshold) {
    regularHours  = rules.daily_threshold
    overtimeHours = totalHours - rules.daily_threshold
  } else {
    regularHours    = rules.daily_threshold
    overtimeHours   = rules.double_time_threshold - rules.daily_threshold
    doubleTimeHours = totalHours - rules.double_time_threshold
  }

  // Weekly overtime check
  const hoursBeforeToday = weeklyHours
  const hoursAfterToday  = hoursBeforeToday + regularHours

  if (hoursAfterToday > rules.weekly_threshold) {
    const weeklyOvertimeHours = hoursAfterToday - rules.weekly_threshold
    regularHours  = Math.max(0, regularHours - weeklyOvertimeHours)
    overtimeHours = parseFloat((overtimeHours + weeklyOvertimeHours).toFixed(2))
  }

  // Calculate pay
  const today = new Date().toISOString().split('T')[0]
  const { data: attRecord } = await supabase
    .from('attendance')
    .select('hourly_rate')
    .eq('employee_id', employeeId)
    .eq('date', today)
    .single()

  const hourlyRate          = attRecord?.hourly_rate || 25
  const overtimePay         = overtimeHours   * hourlyRate * rules.rate_multiplier
  const doubleTimePay       = doubleTimeHours * hourlyRate * rules.double_time_multiplier
  const totalOvertimeAmount = parseFloat((overtimePay + doubleTimePay).toFixed(2))

  // Save to attendance
  const { data, error } = await supabase
    .from('attendance')
    .update({
      clock_out:         clockOutTime,
      hours_today:       parseFloat(totalHours.toFixed(2)),
      regular_hours:     parseFloat(regularHours.toFixed(2)),
      overtime_hours:    parseFloat(overtimeHours.toFixed(2)),
      double_time_hours: parseFloat(doubleTimeHours.toFixed(2)),
      overtime:          parseFloat((overtimeHours + doubleTimeHours).toFixed(2)),
      overtime_amount:   totalOvertimeAmount,
      status:            'clocked-out',
    })
    .eq('employee_id', employeeId)
    .eq('date', today)
    .select()

  if (error) console.error('calculateAndSaveOvertime error:', error)

  return {
    totalHours:          parseFloat(totalHours.toFixed(2)),
    regularHours:        parseFloat(regularHours.toFixed(2)),
    overtimeHours:       parseFloat(overtimeHours.toFixed(2)),
    doubleTimeHours:     parseFloat(doubleTimeHours.toFixed(2)),
    totalOvertimeAmount,
    hourlyRate,
  }
}

export async function getOvertimeReport() {
  const { data, error } = await supabase
    .from('attendance')
    .select(`
      *,
      employees ( name, avatar, department, role )
    `)
    .gt('overtime_hours', 0)
    .order('overtime_hours', { ascending: false })
  if (error) console.error('getOvertimeReport error:', error)
  return data || []
}