<template>
  <div class="w-full bg-base-100 rounded-2xl p-4">
    <h4 class="text-xl font-bold tracking-tight">Today so far..</h4>
    <UiSeparator class="my-4" />
    <div class="grid place-content-center text-center">
      <!-- TASK get actual count -->
      <span
        v-if="data && data.length"
        class="font-extrabold text-primary text-6xl"
        >{{ data[0]?.count }}</span
      >
      <span>Activities added</span>
    </div>
    <UiSeparator class="my-4" />
  </div>
</template>

<script setup>
const { data, pending, error } = useFetch('/api/activities/getActivities', {
  query: {
    count: true,
  },
  key: 'activityCount',
})
</script>
