<template>
  <div
    class="w-full h-[350px] prose mx-auto grid place-content-center text-center relative"
  >
    <GraphicsNoActivities class="w-5/6 h-5/6" />
    <h2 class="mt-0 mb-2">
      {{ currentTitle }}
    </h2>
    <p v-if="canSubmit()">
      Use the add activity panel above to add an activity
    </p>
    <p v-else>
      Activities can not be added in the future, pick a date in the past/present
    </p>
  </div>
</template>

<script setup>
import { useSelectedDate } from '#imports'
import { DateTime } from 'luxon'

const dateStore = useSelectedDate()

const canSubmit = () => {
  // cannot submit in the future
  const t = new Date()
  const d = new Date(dateStore.currentDate)

  return !(d >= t)
}

const props = defineProps({
  title: {
    type: String,
    default: ``,
  },
})

const computeTitle = () => {
  const d = DateTime.fromISO(dateStore?.currentDate).toFormat('dd MMM')
  return dateStore.isSelectedToday()
    ? 'No activities added for today'
    : `No activities added for ${d}`
}

const currentTitle = ref(props.title || computeTitle())
</script>
