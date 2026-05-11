import { computed, ref } from 'vue'
import {
  formatDateKey,
  formatLongDate,
  getPeriodKey,
  getTotalPeriodsSince,
  getWeekKey,
  isDateInCurrentWeek,
  parseDateKey,
} from '../lib/date'

const STORAGE_KEY = 'daily-habit-tracker:v1'

const habits = ref([])
const isReady = ref(false)

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `habit-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalizeHabit(input) {
  return {
    id: input.id ?? generateId(),
    name: String(input.name ?? '').trim(),
    category: String(input.category ?? '').trim() || 'General',
    frequency: input.frequency === 'weekly' ? 'weekly' : 'daily',
    createdAt: input.createdAt ?? new Date().toISOString(),
    completions: Array.isArray(input.completions) ? input.completions : [],
    notes: String(input.notes ?? '').trim(),
  }
}

function saveHabits() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits.value))
}

function loadHabits() {
  const raw = localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    habits.value = []
    isReady.value = true
    return
  }

  try {
    const parsed = JSON.parse(raw)
    habits.value = Array.isArray(parsed) ? parsed.map(normalizeHabit) : []
  } catch {
    habits.value = []
  }

  isReady.value = true
}

function countCompletedPeriods(habit) {
  const uniquePeriods = new Set(
    habit.completions.map((dateKey) =>
      habit.frequency === 'weekly' ? getWeekKey(parseDateKey(dateKey)) : dateKey,
    ),
  )

  return uniquePeriods.size
}

function getCompletionSet(habit) {
  return new Set(habit.completions)
}

function isHabitDoneToday(habit) {
  return getCompletionSet(habit).has(formatDateKey())
}

function isHabitDoneThisWeek(habit) {
  return habit.completions.some(isDateInCurrentWeek)
}

function sortCompletionKeys(habit) {
  return [...habit.completions].sort((first, second) =>
    first < second ? 1 : first > second ? -1 : 0,
  )
}

function getCurrentStreak(habit) {
  const periodSet = new Set(habit.completions.map((item) => getPeriodKey(item, habit.frequency)))
  const totalPeriods = getTotalPeriodsSince(habit.createdAt, habit.frequency)
  let streak = 0

  for (let index = 0; index < totalPeriods; index += 1) {
    const probe = new Date()
    if (habit.frequency === 'weekly') {
      probe.setDate(probe.getDate() - index * 7)
    } else {
      probe.setDate(probe.getDate() - index)
    }

    const key = getPeriodKey(probe, habit.frequency)
    if (periodSet.has(key)) {
      streak += 1
      continue
    }

    break
  }

  return streak
}

function getLongestStreak(habit) {
  const keys = [...new Set(habit.completions.map((item) => getPeriodKey(item, habit.frequency)))].sort()
  if (!keys.length) {
    return 0
  }

  let longest = 1
  let current = 1

  for (let index = 1; index < keys.length; index += 1) {
    const previous = parseDateKey(keys[index - 1])
    const currentDate = parseDateKey(keys[index])
    const expectedGap = habit.frequency === 'weekly' ? 7 : 1
    const gap = Math.round((currentDate.getTime() - previous.getTime()) / (24 * 60 * 60 * 1000))

    if (gap === expectedGap) {
      current += 1
      longest = Math.max(longest, current)
    } else {
      current = 1
    }
  }

  return longest
}

function getProgressStats(habit) {
  const completedPeriods = countCompletedPeriods(habit)
  const totalPeriods = getTotalPeriodsSince(habit.createdAt, habit.frequency)
  const completionRate = totalPeriods > 0 ? Math.round((completedPeriods / totalPeriods) * 100) : 0

  return {
    totalCheckIns: habit.completions.length,
    completedPeriods,
    totalPeriods,
    completionRate,
    currentStreak: getCurrentStreak(habit),
    longestStreak: getLongestStreak(habit),
    lastCompletedAt: habit.completions.length ? formatLongDate(sortCompletionKeys(habit)[0]) : 'Not yet',
  }
}

function enrichHabit(habit) {
  const stats = getProgressStats(habit)

  return {
    ...habit,
    isDoneToday: isHabitDoneToday(habit),
    isDoneThisWeek: isHabitDoneThisWeek(habit),
    stats,
  }
}

function addHabit(payload) {
  habits.value = [normalizeHabit(payload), ...habits.value]
  saveHabits()
}

function updateHabit(id, payload) {
  habits.value = habits.value.map((habit) =>
    habit.id === id
      ? normalizeHabit({
          ...habit,
          ...payload,
          id: habit.id,
          createdAt: habit.createdAt,
          completions: habit.completions,
        })
      : habit,
  )
  saveHabits()
}

function removeHabit(id) {
  habits.value = habits.value.filter((habit) => habit.id !== id)
  saveHabits()
}

function toggleCompletion(id, dateKey = formatDateKey()) {
  habits.value = habits.value.map((habit) => {
    if (habit.id !== id) {
      return habit
    }

    const completions = new Set(habit.completions)

    if (habit.frequency === 'weekly') {
      const hasCurrentWeekCompletion = habit.completions.some(
        (item) => getWeekKey(parseDateKey(item)) === getWeekKey(parseDateKey(dateKey)),
      )

      if (hasCurrentWeekCompletion) {
        return {
          ...habit,
          completions: habit.completions.filter(
            (item) => getWeekKey(parseDateKey(item)) !== getWeekKey(parseDateKey(dateKey)),
          ),
        }
      }

      completions.add(dateKey)
      return {
        ...habit,
        completions: [...completions].sort(),
      }
    }

    if (completions.has(dateKey)) {
      completions.delete(dateKey)
    } else {
      completions.add(dateKey)
    }

    return {
      ...habit,
      completions: [...completions].sort(),
    }
  })

  saveHabits()
}

function getHabitById(id) {
  return computed(() => {
    const habit = habits.value.find((item) => item.id === id)
    return habit ? enrichHabit(habit) : null
  })
}

const categories = computed(() => {
  const values = new Set(habits.value.map((habit) => habit.category))
  return ['All', ...values]
})

const enrichedHabits = computed(() =>
  habits.value
    .map(enrichHabit)
    .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()),
)

export function useHabits() {
  return {
    habits: enrichedHabits,
    categories,
    isReady,
    loadHabits,
    addHabit,
    updateHabit,
    removeHabit,
    toggleCompletion,
    getHabitById,
  }
}
