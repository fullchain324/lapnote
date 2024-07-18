<template>
  <UiGoalDropdown
    :allGoals="props.allGoals"
    v-if="route.path.indexOf('/goals/') === -1"
    @addGoal="handleAddGoal($event)"
  >
    <label
      tabindex="0"
      :class="`transition-all duration-500 transform btn btn-circle btn-xs m-1 ${
        buttonError
          ? 'btn-error text-error-content scale-[1.10]'
          : 'btn-outline scale-[1]'
      }`"
    >
      <Icon
        :class="`transition-transform duration-300 transform ${
          buttonError ? 'rotate-[45deg]' : 'rotate-0 '
        }`"
        name="material-symbols:add"
        size="18"
      />
    </label>
  </UiGoalDropdown>

  <div
    v-if="hasGoals()"
    class="ml-2 goals-display flex w-full flex-wrap min-w-[80%] items-center gap-2 text-neutral-content"
  >
    <template v-for="goal in getGoals()">
      <UiButton size="xs" kind="outline" extraClasses="font-normal">
        <div v-if="goal?.title" class="flex gap-1 items-center">
          <span class="block">{{ goal.title }}</span>
          <Icon
            class="cursor-pointer"
            @click="handleRemoveGoal(goal)"
            name="mdi:remove"
            size="16"
          />
        </div>
      </UiButton>
    </template>
  </div>
  <Toast position="bottom-right" group="br" />
</template>

<script setup>
import { useToast } from 'primevue/usetoast'
const toast = useToast()
const route = useRoute()

const props = defineProps({
  activity: {
    type: Object,
    default: {},
  },
  goals: {
    type: Object,
    default: null,
  },
  allGoals: {
    type: Object,
    default: null,
  },
})

const buttonError = ref(false)
const currentGoals = ref(props.goals)

const getGoals = () => {
  if (!currentGoals.value) return []

  if (!Array.isArray(currentGoals.value)) {
    return [currentGoals.value]
  }

  return currentGoals.value
}

const hasGoals = () => {
  if (!currentGoals.value) return false

  if (Array.isArray(currentGoals.value)) {
    if (!currentGoals.value.length) return false
  }

  if (!Object.values(currentGoals.value)[0]) {
    return false
  }

  return true
}

const setButtonError = () => {
  buttonError.value = true

  setTimeout(() => {
    buttonError.value = false
  }, 1200)
}

const handleRemoveGoal = (goal) => {
  $fetch('/api/goals/removeGoal', {
    method: 'POST',
    body: JSON.stringify({
      goalId: goal.goalId,
      activityId: props.activity.id,
    }),
    onResponse({ response }) {
      if (response.status !== 200) return
      currentGoals.value = currentGoals.value.filter((f) => f !== goal)
    },
    onResponseError() {
      setButtonError()
    },
  })
}

const handleAddGoal = (goal) => {
  if (
    currentGoals.value[0] &&
    currentGoals.value.find((f) => f.goalId === goal.goalId)
  ) {
    setButtonError()

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Cannot add duplicate goals',
      group: 'br',
      life: 3000,
    })

    document.activeElement.blur()

    return
  }
  $fetch('/api/goals/addGoal', {
    method: 'POST',
    body: JSON.stringify({
      goalId: goal.goalId,
      activityId: props.activity.id,
    }),
    onResponse({ response }) {
      if (response.status !== 200) return

      currentGoals.value = !currentGoals.value[0]
        ? [goal]
        : [goal, ...currentGoals.value]

      // toggles dropdown
      document.activeElement.blur()
    },
    onResponseError() {
      setButtonError()
    },
  })
}
</script>
