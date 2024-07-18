<template>
  <div class="summaries">
    <div class="heading flex justify-between">
      <h1 class="text-xl font-semibold tracking-tighter">Summaries</h1>
      <UiButton kind="primary" @click="handleCreate">Create summary</UiButton>
    </div>
    <UiSeparator class="my-12" />
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3" v-if="data">
      <template v-for="(summary, i) in data">
        <div class="summary relative">
          <div class="absolute right-2 top-2">
            <UiButton @click="openSummaryModal(summary)" size="xs" kind="ghost">
              <Icon name="mingcute:delete-line" size="18" />
            </UiButton>
          </div>
          <NuxtLink
            :to="`/summaries/${summary.id}?title=${JSON.stringify(
              summary.title
            )}&content=${JSON.stringify(
              summary.content
            )}&created_at=${JSON.stringify(summary.created_at)}`"
          >
            <div
              class="text-left flex items-center justify-between gap-3 dark:hover:bg-base-300 dark:hover:text-white hover:bg-base-200 bg-gradient-to-br from-transparent to-base-300 cursor-pointer p-3 border border-base-300 dark:border-neutral/50 rounded-md"
            >
              <div class="title-desc w-full">
                <div class="title mb-2 flex gap-2 justify-between items-center">
                  <div class="main-title">
                    <div class="title flex gap-2 items-center">
                      <span class="block text-md">{{ summary.title }} </span>
                      <UiAiBadge v-if="summary.ai_generated" />
                    </div>
                    <span
                      class="block text-sm text-neutral/80 dark:text-white/60"
                      >{{ summary.description }}</span
                    >
                  </div>
                </div>

                <div
                  class="desc w-full items-center flex gap-2 justify-between"
                >
                  <div class="text-xs self-end ml-auto">
                    {{ getDate(summary) }}
                    / created at {{ useDateTime(summary.created_at) }}
                  </div>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
      </template>
    </div>
  </div>
  <UiModal id="summary">
    <template #title> Create summary </template>
    <template #default> Coming soon... </template>
    <!-- <template #buttons>
      <button @click="closeModal" class="btn btn-ghost btn-sm">cancel</button>
      <button class="btn btn-error btn-sm" @click="deleteGoal">
        Delete Goal
      </button>
    </template> -->
  </UiModal>
  <UiModal id="delete_summary_modal">
    <template #title> Deleting summary </template>
    <template #default> The summary will be lost, are you sure? </template>
    <template #buttons>
      <button @click="closeDeleteSummaryModal" class="btn btn-ghost btn-sm">
        cancel
      </button>
      <button class="btn btn-error btn-sm" @click="deleteSummary">
        Delete Summaries
      </button>
    </template>
  </UiModal>
  <Toast position="bottom-right" group="br" />
</template>

<script setup>
import { DateTime } from 'luxon'
import { useToast } from 'primevue/usetoast'
const toast = useToast()

const { data, pending, error } = useFetch('/api/summaries/getSummaries', {
  key: 'summaries',
})

const currentlySelectedSummary = ref(null)

const handleCreate = () => {
  summary.showModal()
  useQueryRoute('add', 'summary_modal_open', 'true')
}

const getDate = (summary) => {
  if (!summary.dates) {
    return ''
  }

  const d = JSON.parse(summary.dates)
  return (
    DateTime.fromISO(d.startDate).toFormat('dd MMM') +
    ' - ' +
    DateTime.fromISO(d.endDate).toFormat('dd MMM yy')
  )
}

const closeDeleteSummaryModal = () => {
  delete_summary_modal.close()
  currentlySelectedSummary.value = null
}

const deleteSummary = () => {
  $fetch('/api/summaries/deleteSummary', {
    method: 'POST',
    body: JSON.stringify({
      id: currentlySelectedSummary.value.id,
    }),
    onResponse({ response }) {
      if (response.status !== 200) return
      closeDeleteSummaryModal()

      refreshNuxtData('summaries')
    },
    onResponseError({ response }) {
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

const openSummaryModal = (summary) => {
  currentlySelectedSummary.value = summary
  delete_summary_modal.showModal()
}
</script>
