<template>
  <h1 v-if="summary?.title" class="text-4xl font-extrabold mb-8">
    {{ summary.title }}
  </h1>
  <div
    v-if="summary"
    @mouseover="showOptions = true"
    @mouseleave="showOptions = false"
    class="activity-container p-4 rounded-2xl max-w-none 2xl:max-w-[unset] activity prose relative mb-2 w-full transition-all"
  >
    <InputTipTap
      v-if="isEditing"
      v-model="summary.content"
      autoFocus="end"
      @update:modelValue="handleEditing(summary)"
      classProps="border-0 outline-0 focus:outline-0 focus:border-0"
    />

    <vue-markdown v-else @click="isEditing = true" :source="summary.content" />

    <div class="edit-actions absolute right-4 top-2" v-if="(isEditing = true)">
      <Icon
        @click="handleDelete(summary)"
        class="cursor-pointer hover:text-primary"
        name="mingcute:delete-line"
        size="18"
      />
    </div>

    <div class="time-edit-container flex items-center justify-between">
      <span class="w-full text-right text-xs text-base-content"
        >at {{ getTime(summary.created_at) }}</span
      >
    </div>
  </div>
</template>

<script setup>
import { DateTime } from 'luxon'
import VueMarkdown from 'vue-markdown-render'

const route = useRoute()
const summary = ref(null)
const isEditing = ref(false)

const getTime = (date) => {
  if (!date) return ''

  const formatted = DateTime.fromISO(date).toFormat('HH:mm')

  return formatted
}

const handleDelete = (summary) => {
  console.log('delete', summary)
}

onBeforeMount(() => {
  if (!route?.query) return
  const { title, content, created_at } = route.query
  summary.value = {
    title: JSON.parse(title),
    content: JSON.parse(content),
    created_at: JSON.parse(created_at),
  }
})
</script>
