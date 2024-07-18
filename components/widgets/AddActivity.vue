<template>
  <div class="w-full min-w-[71ch]">
    <h1 class="text-xl tracking-tighter font-semibold text-content">
      <span v-if="!props.title">
        Hey
        <span v-if="data?.user?.name">{{ data.user.name.split(' ')[0] }}</span>
      </span>
      <span v-else>
        {{ props.title }}
      </span>
    </h1>
    <p class="text-neutral/50 dark:text-white/50 text-sm">
      <span v-if="!props.subtitle"> what have you been up to? </span>
      <span v-else>
        {{ props.subtitle }}
      </span>
    </p>

    <UiSeparator class="my-4" />

    <InputTipTap
      v-model="activityContent"
      classProps="mt-8 rounded-md bg-base-300/30 dark:bg-base-100 min-h-[125px] border border-base-300 dark:border-neutral/30 prose prose-slate w-full min-w-full mx-auto prose-base"
    />

    <UiSeparator class="mb-4" />

    <div class="flex actions justify-between gap-2">
      <div class="actions flex items-start gap-2">
        <div class="type">
          <UiDropdown
            :list="activityTypes"
            @change="selectedType = $event.name"
            nameKey="name"
            dropdownLabel="Select an activity type"
          >
            <template #label>
              <UiButton size="sm" kind="outline">
                <span class="capitalize">{{ selectedType }}</span>
                <Icon name="mdi:chevron-down" size="18" />
              </UiButton>
            </template>
          </UiDropdown>
        </div>
        <UiDropdown
          @change="handleGoal($event)"
          :list="goalsData"
          dropdownLabel="Select a goal"
        >
          <template #label>
            <UiButton v-if="!goalPreview" size="sm" kind="outline">
              <Icon name="material-symbols:add" size="18" /> Add goal
            </UiButton>
            <UiButton v-else kind="success" size="sm">
              <Icon @click="removeGoal" name="mdi:remove" size="18" />
              {{ goalPreview.title }}
            </UiButton>
          </template>
          <template #empty-list>
            <NuxtLink to="/goals"
              ><li><a>Create goal</a></li></NuxtLink
            ></template
          >
        </UiDropdown>
      </div>
      <div class="submit">
        <UiButton
          :disabled="!canSubmit()"
          :state="buttonState"
          @click="handleAdd"
          kind="primary"
          >Add {{ selectedType }}</UiButton
        >
      </div>
    </div>
  </div>
  <Toast position="bottom-right" group="br" />
</template>

<script setup>
import { useToast } from 'primevue/usetoast'
import { useSelectedDate } from '#imports'

const { data } = useAuth()
const goalPreview = ref(null)
const activityContent = ref('')
const toast = useToast()
const dateStore = useSelectedDate()

const selectedType = ref('activity')

const buttonState = ref(null)

const activityTypes = [
  {
    name: 'activity',
  },
  {
    name: 'feedback',
  },
]

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
})

const canSubmit = () => {
  // cannot submit in the future
  const t = new Date()
  const d = new Date(dateStore.currentDate)

  return !(d >= t)
}

const handleAdd = () => {
  buttonState.value = 'loading'
  $fetch('/api/activities/createActivity', {
    body: {
      content: activityContent.value,
      goalId: goalPreview?.value?.goalId,
      type: selectedType.value,
      date:
        dateStore.currentDate && !dateStore.isSelectedToday()
          ? dateStore.currentDate
          : new Date().toISOString(),
    },
    method: 'POST',
    onResponse({ response }) {
      if (response.status !== 200) return
      activityContent.value = ''
      refreshNuxtData('activities')
      refreshNuxtData('dailyActivities')
      refreshNuxtData('activityCount')
      goalPreview.value = null
      toast.add({
        severity: 'success',
        summary: 'Done',
        detail: 'Activity added',
        group: 'br',
        life: 3000,
      })
      buttonState.value = 'done'
    },
    onResponseError({ response }) {
      buttonState.value = 'error'
      toast.add({
        severity: 'error',
        summary: 'Oh no!',
        detail: response._data.statusMessage,
        group: 'br',
        life: 5000,
      })
    },
  })
}

const {
  data: goalsData,
  pending,
  error,
} = useFetch('/api/goals/getGoals', {
  key: 'goals',
})

const handleGoal = (goal) => {
  goalPreview.value = goal
}

const removeGoal = () => {
  goalPreview.value = null
}
</script>
