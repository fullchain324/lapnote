<template>
  <div
    v-if="!props.addingTask"
    class="no-tasks relative min-w-[370px] min-h-[276px] grid place-content-center"
  >
    <div class="no-tasks text-center z-[2]">
      <h4 class="text-2xl font-bold">Nothing to see here</h4>
      <p class="mb-4 mt-0">{{ descriptionTest }}</p>
      <UiButton @click="$emit('adding')" kind="primary">Add a task</UiButton>
      <GraphicsNoTasks
        class="pointer-events-none w-5/6 h-5/6 absolute right-0 bottom-0 opacity-10 z-[-1]"
      />
    </div>
  </div>
</template>

<script setup>
import { useSelectedDate } from '#imports'
const dateStore = useSelectedDate()
import { DateTime } from 'luxon'

const props = defineProps({
  addingTask: {
    type: Boolean,
  },
})

const descriptionTest = computed(() => {
  const isToday = dateStore.isSelectedToday()
  let dateToUse = dateStore.currentDate

  if (Array.isArray(dateToUse)) {
    dateToUse = dateToUse[0]
  }

  const d = DateTime.fromISO(
    useGetISOStringFromDate(dateToUse || new Date())
  ).toFormat('dd MMM')

  if (!isToday) {
    return `Add a task for ${d}`
  }

  return `what do you need to do today?`
})
</script>
