<template v-if="status !== 'authenticated'">
  <slot />
</template>

<script setup>
const { status } = useAuth()
onBeforeMount(async () => {
  if (status.value === 'authenticated') {
    await navigateTo('/')
  }
})
</script>
