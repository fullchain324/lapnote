<template>
  <Transition name="fade" mode="out-in">
    <div v-if="pending">
      <div
        class="w-full h-[350px] prose max-w-none grid place-content-center text-center relative"
      >
        <span class="loading loading-dots loading-lg"></span>
      </div>
    </div>

    <div
      v-else-if="data && data?.activities?.length"
      class="dates-activities-container"
    >
      <div class="dates mb-4 flex gap-4" v-for="date in getDates(data.dates)">
        <div
          class="date-block h-max min-h-[65px] bg-base-100 dark:bg-base-200 min-w-[65px] rounded-2xl border border-neutral-content dark:border-neutral/30 px-3 py-2 text-center"
        >
          <ClientOnly>
            <span class="day block text-2xl font-bold text-primary">
              {{ formatDate(date, 'day') }}
            </span>
            <span class="month block text-xs uppercase">
              {{ formatDate(date, 'month') }}
            </span>
          </ClientOnly>
        </div>
        <div class="activities w-full">
          <template v-for="(item, i) in data.activities">
            <template v-if="shouldShowDate(item.activity, date)">
              <div
                @mouseover="handleShowOptions(i)"
                @mouseleave="handleShowOptions(null)"
                class="activity-container p-4 rounded-2xl max-w-none 2xl:max-w-[unset] bg-base-100 hover:bg-base-200 dark:bg-base-200 dark:hover:bg-base-300 activity prose relative mb-2 w-full border dark:border-neutral/30 border-neutral-content transition-all"
              >
                <span class="text-xs capitalize dark:text-white/40 font-bold">{{
                  item.activity.type
                }}</span>
                <InputTipTap
                  v-if="editingIndex === i"
                  v-model="item.activity.content"
                  autoFocus="end"
                  @update:modelValue="handleEditing(item.activity)"
                  classProps="border-0 outline-0 focus:outline-0 focus:border-0"
                />

                <div
                  v-else
                  @click="editingIndex = i"
                  v-html="item.activity.content"
                />

                <div
                  class="edit-actions absolute right-4 top-2"
                  v-if="editIconsIndex === i"
                >
                  <Icon
                    @click="handleDelete(item.activity)"
                    class="cursor-pointer hover:text-primary"
                    name="mingcute:delete-line"
                    size="18"
                  />
                </div>

                <div
                  class="time-edit-container flex items-center justify-between"
                >
                  <UiGoalSelector
                    :activity="item.activity"
                    :goals="item.goals"
                    :allGoals="allGoals"
                  />

                  <span class="w-full text-right text-xs text-base-content"
                    >at {{ useDateTime(item.activity.created_at) }}</span
                  >
                </div>
              </div>
            </template>
          </template>
        </div>
      </div>
    </div>

    <div v-else-if="!data?.activities?.length && !pending">
      <WidgetsActivityEmpty :title="props.title" />
    </div>
    <div v-else-if="error">Error fetching activities {{ error }}</div>
  </Transition>

  <UiModal id="delete_modal">
    <template #title> Deleting activity </template>
    <template #default> The activity will be lost, are you sure? </template>
    <template #buttons>
      <button @click="closeModal" class="btn btn-ghost btn-sm">cancel</button>
      <button class="btn btn-error btn-sm" @click="deleteActivity">
        Delete Activity
      </button>
    </template>
  </UiModal>
</template>

<script setup>
import { DateTime } from 'luxon'
import { getLang } from '~/helpers/getLang'
import { useDebounceFn } from '@vueuse/core'
import { useSelectedDate } from '#imports'

const route = useRoute()
const editIconsIndex = ref(null)
const editingIndex = ref(null)
const selectedActivity = ref(null)
const dateStore = useSelectedDate()

const props = defineProps({
  limit: {
    type: Number,
    default: null,
  },
  date: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: '',
  },
  queryKey: {
    type: String,
    default: 'activities',
  },
})

const { data, pending, error } = useAsyncData(
  props.queryKey,
  () =>
    $fetch('/api/activities/getActivities', {
      params: {
        goalId: route?.params?.id || null,
        date: props.date ? dateStore?.currentDate : null,
      },
    }),
  {
    watch: [!props.date ? ref(null) : dateStore],
    server: false,
    lazy: true,
    transform(data) {
      const dates = data.map((d) => d.activity.created_at)
      return {
        activities: data,
        dates: dates,
      }
    },
  }
)

const { data: allGoals } = useFetch('/api/goals/getGoals', {
  key: 'goals',
})

const getDates = (dates) => {
  return [
    ...new Set(
      dates.map((d) => {
        return DateTime.fromISO(d).toLocaleString()
      })
    ),
  ]
}

const shouldShowDate = (activity, date) => {
  const activityDate = DateTime.fromISO(activity.created_at).toLocaleString()
  return activityDate === date
}

const formatDate = (date, stringFormat) => {
  const d = DateTime.fromFormat(date, 'd/MM/yyyy').setLocale(getLang())

  switch (true) {
    case stringFormat === 'day':
      return d.toLocaleString({
        day: '2-digit',
      })
    case stringFormat === 'month':
      return d.toLocaleString({
        month: 'short',
      })
  }
}

const handleShowOptions = (index) => {
  if (!index) {
    editIconsIndex.value = null
  }

  editIconsIndex.value = index
}

const handleDelete = (activity) => {
  selectedActivity.value = activity
  delete_modal.showModal()
}

const deleteActivity = () => {
  $fetch('/api/activities/deleteActivity', {
    method: 'POST',
    body: JSON.stringify(selectedActivity.value),
    onResponse() {
      refreshNuxtData(props.queryKey)
      refreshNuxtData('activityCount')
      refreshNuxtData('dailyActivities')
      closeModal()
    },
  })
}

// TASK - add optimisations to persist text
// debounce is cool but too many requests atm
// need to do things like check window blur, save when that happens (?)
// or if we detect too many requests happening slow them down
// by artificially upping debounce time?
const handleEditing = useDebounceFn((activity) => {
  // add a saving indicator
  $fetch('/api/activities/updateActivity', {
    method: 'POST',
    body: JSON.stringify(activity),
    onResponseError() {
      // TASK negate optimistic update
    },
    onResponse() {},
  })
}, 1000)

const closeModal = () => {
  delete_modal.close()
}
</script>

<style>
.activity-container .tiptap {
  padding: 0;
}
</style>
