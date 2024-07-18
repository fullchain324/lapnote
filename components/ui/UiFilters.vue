<template v-if="filters?.length">
  <div class="filters flex gap-2">
    <UiButton
      extraClasses="font-normal"
      v-for="filter in filters"
      @click="filter.fn"
      :kind="currentRoute === filter.param ? 'primary' : 'outline'"
      size="xs"
      >{{ filter.name }}</UiButton
    >
  </div>
</template>

<script setup>
const router = useRoute()

const currentRoute = ref(router.query.filter)

const props = defineProps({
  filters: {
    type: Array,
    default: [],
  },
})

watch(
  () => router.query,
  () => {
    currentRoute.value = router.query.filter
  }
)
</script>
