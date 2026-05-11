<template>
  <form class="panel form-panel" @submit.prevent="handleSubmit">
    <div class="panel__header">
      <div>
        <p class="eyebrow">Habit Editor</p>
        <h2>{{ isEditing ? 'Update habit' : 'Create a new habit' }}</h2>
      </div>
      <button
        v-if="isEditing"
        class="text-button"
        type="button"
        @click="handleCancel"
      >
        Cancel
      </button>
    </div>

    <label class="field">
      <span>Name</span>
      <input v-model.trim="form.name" type="text" placeholder="Morning workout" maxlength="60" />
    </label>

    <label class="field">
      <span>Category</span>
      <input v-model.trim="form.category" type="text" placeholder="Health" maxlength="40" list="categories-list" />

      <datalist id="categories-list">
        <option
          v-for="category in categories"
          :key="category"
          :value="category"
        />
      </datalist>
    </label>

    <label class="field">
      <span>Frequency</span>
      <select v-model="form.frequency">
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
      </select>
    </label>

    <label class="field">
      <span>Notes</span>
      <textarea
        v-model.trim="form.notes"
        rows="4"
        placeholder="Why this habit matters or how you want to keep it."
      />
    </label>

    <button class="primary-button" type="submit">
      {{ submitLabel }}
    </button>
  </form>
</template>

<script>
import { defineComponent } from 'vue'

function createDefaultFormState() {
  return {
    name: '',
    category: '',
    frequency: 'daily',
    notes: '',
  }
}

function createFormStateFromValues(value) {
  return {
    ...createDefaultFormState(),
    name: value?.name ?? '',
    category: value?.category ?? '',
    frequency: value?.frequency ?? 'daily',
    notes: value?.notes ?? '',
  }
}

export default defineComponent({
  name: 'HabitForm',
  props: {
    initialValues: {
      type: Object,
      default: null,
    },
    submitLabel: {
      type: String,
      default: 'Save habit',
    },
    categories: {
      type: Array,
      default: () => [],
    }
  },
  emits: ['submit', 'cancel'],
  data() {
    return {
      form: createDefaultFormState(),
    }
  },
  computed: {
    isEditing() {
      return Boolean(this.initialValues)
    },
  },
  watch: {
    initialValues: {
      immediate: true,
      handler(value) {
        this.syncForm(value)
      },
    },
  },
  methods: {
    syncForm(value) {
      this.form = createFormStateFromValues(value)
    },
    resetForm() {
      this.form = createDefaultFormState()
    },
    handleCancel() {
      this.$emit('cancel')
    },
    handleSubmit() {
      if (!this.form.name.trim()) {
        return
      }

      this.$emit('submit', {
        name: this.form.name,
        category: this.form.category,
        frequency: this.form.frequency,
        notes: this.form.notes,
      })

      if (!this.isEditing) {
        this.resetForm()
      }
    },
  },
})
</script>
