const DAY_MS = 24 * 60 * 60 * 1000

function normalizeDateInput(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return parseDateKey(value)
  }

  return new Date(value)
}

export function startOfDay(value = new Date()) {
  const date = normalizeDateInput(value)
  date.setHours(0, 0, 0, 0)
  return date
}

export function formatDateKey(value = new Date()) {
  const date = startOfDay(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatLongDate(dateKey) {
  return parseDateKey(dateKey).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function startOfWeek(value = new Date()) {
  const date = startOfDay(value)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  return date
}

export function addDays(value, amount) {
  const date = normalizeDateInput(value)
  date.setDate(date.getDate() + amount)
  return date
}

export function diffInDays(start, end) {
  const startDate = startOfDay(start)
  const endDate = startOfDay(end)
  return Math.floor((endDate.getTime() - startDate.getTime()) / DAY_MS)
}

export function getWeekKey(value = new Date()) {
  return formatDateKey(startOfWeek(value))
}

export function getPeriodKey(value, frequency) {
  return frequency === 'weekly' ? getWeekKey(value) : formatDateKey(value)
}

export function getTotalPeriodsSince(startDate, frequency, endDate = new Date()) {
  if (!startDate) {
    return 0
  }

  if (frequency === 'weekly') {
    const start = startOfWeek(startDate)
    const end = startOfWeek(endDate)
    return Math.floor(diffInDays(start, end) / 7) + 1
  }

  return diffInDays(startDate, endDate) + 1
}

export function listPeriodsBack(frequency, count, endDate = new Date()) {
  const dates = []
  const unit = frequency === 'weekly' ? 7 : 1
  const baseDate =
    frequency === 'weekly' ? startOfWeek(endDate) : startOfDay(endDate)

  for (let index = count - 1; index >= 0; index -= 1) {
    dates.push(addDays(baseDate, -index * unit))
  }

  return dates
}

export function isDateInCurrentWeek(dateKey) {
  return getWeekKey(parseDateKey(dateKey)) === getWeekKey(new Date())
}
