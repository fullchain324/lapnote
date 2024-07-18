<template>
  <label for="cars">Select a goal:</label>

  <div class="form w-full relative">
    <input type="text" name="search" class="input input-bordered w-full" />
    <Icon
      @click=""
      name="tabler:chevron-down"
      size="24"
      class="absolute top-1/2 right-2 transform -translate-y-1/2"
    />
  </div>
</template>

<script setup>
/**
 * this should be a select
 * that also lets you search
 * so pretty much a text input
 * with an arrow that opens a dropdown
 */
const { data, pending, error } = useFetch('/api/goals/getGoals')

const props = defineProps({
  context: Object,
})
</script>
