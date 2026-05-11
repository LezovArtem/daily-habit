<template>
  <section class="dashboard-grid">
    <HabitForm
      :initial-values="editingHabit"
      :submit-label="submitLabel"
      :categories="categories"
      @submit="handleSubmit"
      @cancel="clearEditingHabit"
    />

    <div class="dashboard-main">
      <section class="stats-strip">
        <article class="metric-card">
          <span>Total habits </span>
          <strong>{{ dashboardStats.totalHabits }}</strong>
        </article>
        <article class="metric-card">
          <span>Done today </span>
          <strong>{{ dashboardStats.completedToday }}</strong>
        </article>
        <article class="metric-card">
          <span>Average success </span>
          <strong>{{ dashboardStats.averageRate }}%</strong>
        </article>
      </section>

      <section class="panel">
        <div class="panel__header panel__header--stack">
          <div>
            <p class="eyebrow">Habit Board</p>
            <h2>All habits</h2>
          </div>

          <label class="field field--compact">
            <span>Filter by category</span>
            <select v-model="selectedCategory">
              <option
                v-for="category in categories"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>
          </label>
        </div>

        <div v-if="filteredHabits.length" class="habit-list">
          <HabitCard
            v-for="habit in filteredHabits"
            :key="habit.id"
            :habit="habit"
            :categories="categories"
            @toggle="handleToggleCompletion"
            @edit="startEditingHabit"
            @delete="handleDelete"
          />
        </div>

        <div v-else class="empty-state">
          <h3>No habits yet</h3>
          <p>Create your first habit to start tracking consistency over time.</p>
        </div>
      </section>
    </div>
  </section>
</template>

<script>
import { defineComponent } from 'vue'
import HabitCard from '../components/HabitCard.vue'
import HabitForm from '../components/HabitForm.vue'
import { useHabits } from '../composables/useHabits'

const habitsStore = useHabits()

export default defineComponent({
  name: 'HomeView',
  components: {
    HabitCard,
    HabitForm,
  },
  data() {
    return {
      selectedCategory: 'All',
      editingHabit: null,
    }
  },
  computed: {
    habits() {
      return habitsStore.habits.value
    },
    categories() {
      return habitsStore.categories.value
    },
    isEditing() {
      return this.editingHabit !== null
    },
    submitLabel() {
      return this.isEditing ? 'Save changes' : 'Add habit'
    },
    filteredHabits() {
      if (this.selectedCategory === 'All') {
        return this.habits
      }

      return this.habits.filter((habit) => this.isHabitInSelectedCategory(habit))
    },
    dashboardStats() {
      return {
        totalHabits: this.habits.length,
        completedToday: this.getCompletedTodayCount(),
        averageRate: this.getAverageRate(),
      }
    },
  },
  methods: {
    isHabitInSelectedCategory(habit) {
      return habit.category === this.selectedCategory
    },
    getCompletedTodayCount() {
      return this.habits.filter((habit) => habit.isDoneToday).length
    },
    getAverageRate() {
      if (!this.habits.length) {
        return 0
      }

      const totalRate = this.habits.reduce(
        (sum, habit) => sum + habit.stats.completionRate,
        0,
      )

      return Math.round(totalRate / this.habits.length)
    },
    handleSubmit(payload) {
      if (this.isEditing) {
        habitsStore.updateHabit(this.editingHabit.id, payload)
        this.clearEditingHabit()
        return
      }

      habitsStore.addHabit(payload)
    },
    handleDelete(id) {
      habitsStore.removeHabit(id)

      if (this.editingHabit?.id === id) {
        this.clearEditingHabit()
      }
    },
    handleToggleCompletion(id) {
      habitsStore.toggleCompletion(id)
    },
    startEditingHabit(habit) {
      this.editingHabit = habit
    },
    clearEditingHabit() {
      this.editingHabit = null
    },
  },
})
</script>
