import { useMemo, useState } from 'react'
import { formatLocalISODate } from '../utils/dateUtils'

function startOfWeek(date) {
  const dt = new Date(date)
  const day = dt.getDay()
  const diff = day === 0 ? -6 : 1 - day
  dt.setDate(dt.getDate() + diff)
  dt.setHours(0, 0, 0, 0)
  return dt
}

function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function useWeekRange(initialDate = new Date()) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(initialDate))
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart])
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])

  function goPrevWeek() {
    setWeekStart((d) => addDays(d, -7))
  }

  function goNextWeek() {
    setWeekStart((d) => addDays(d, 7))
  }

  function goCurrentWeek() {
    setWeekStart(startOfWeek(new Date()))
  }

  function toISO(date) {
    return formatLocalISODate(date)
  }

  return { weekStart, weekEnd, weekDays, setWeekStart, goPrevWeek, goNextWeek, goCurrentWeek, toISO }
}
