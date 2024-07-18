<template>
  <div class="calendar disable-selection">
    <Calendar
      :selectionMode="currentSelectionMode"
      @update:modelValue="updateDateStore"
      inline
      v-model="date"
    >
      <template #footer>
        <div class="toggle-selection justify-between flex items-center p-3">
          <div class="w-max">
            <label class="label cursor-pointer flex gap-2 items-center">
              <span class="label-text">Range selection</span>
              <input type="checkbox" class="toggle" v-model="selection" />
            </label>
          </div>
          <div v-if="date">
            <UiButton @click="openSummaryModal" size="sm" kind="primary">
              Get Summary
            </UiButton>
          </div>
        </div>
      </template>
    </Calendar>
  </div>
  <UiModal
    @close="useQueryRoute('remove', 'summary_modal_open')"
    id="summary_modal"
  >
    <template #title>Get Summary</template>
    <template #default>
      <FormKit
        @submit="submitHandler"
        type="form"
        :submit-attrs="{
          inputClass: 'btn btn-primary',
        }"
        submit-label="Generate Summary"
        v-model="formData"
      >
        <FormKit
          type="text"
          name="title"
          label="Title"
          validation="required:trim|length:0, 50"
        />
        <FormKit type="text" name="description" label="Description" />
        <FormKit
          :outer-class="{
            'formkit-outer': false,
          }"
          name="use_ai"
          validation="required"
          type="radio"
          label="Use ✨ AI ✨ to generate a summary?"
          :options="[
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ]"
        />
      </FormKit>
    </template>
  </UiModal>
  <Toast position="bottom-right" group="br" />
</template>

<script setup>
import { useToast } from 'primevue/usetoast'
import { useSelectedDate } from '#imports'
const toast = useToast()
const router = useRouter()
const route = useRoute()

const { currentRoute } = router
const formData = ref(null)
const date = ref(null)

const modes = {
  SINGULAR: 'single',
  RANGE: 'range',
}

const selection = ref(false)

watch(selection, (prevValue) => {
  date.value = null

  prevValue
    ? (currentSelectionMode.value = modes.RANGE)
    : (currentSelectionMode.value = modes.SINGULAR)
})

const dateStore = useSelectedDate()

const currentSelectionMode = ref(modes.SINGULAR)

const updateDateStore = (date) => {
  if (Array.isArray(date)) {
    const newDate = date.map((d) => (d ? d.toISOString() : null))

    useQueryRoute('add', 'dates', newDate[1] ? newDate.join(',') : newDate[0])
    dateStore.changeCurrentDate(newDate)
    return
  }
  dateStore.changeCurrentDate(date.toISOString())
  useQueryRoute('add', 'dates', date.toISOString())
}

watch(
  () => route.path,
  () => {
    if (!dateStore.currentDate) return

    if (dateStore.isSelectedToday()) {
      return
    }

    if (Array.isArray(dateStore.currentDate)) {
      const d = [...dateStore.currentDate].map((x) => {
        return typeof x === 'string' ? new Date(x) : x
      })

      updateDateStore(d)
      return
    }

    updateDateStore(new Date(dateStore.currentDate))
  }
)

const setDatesFromQuery = async () => {
  const { dates } = currentRoute.value.query

  if (!dates) {
    date.value = null
    return
  }

  let n = dates.split(',')

  if (n.length > 1) {
    n = n.map((f) => new Date(f))

    selection.value = true
    await nextTick()

    date.value = [n[0], n[1]]
  } else {
    date.value = new Date(dates)
  }

  updateDateStore(date.value)
}

onMounted(async () => {
  if (!!currentRoute.value.query.summary_modal_open) {
    summary_modal.showModal()
  }

  setDatesFromQuery()
})

const openSummaryModal = () => {
  summary_modal.showModal()
  useQueryRoute('add', 'summary_modal_open', 'true')
}

const submitHandler = (data) => {
  const res = new Promise((resolve, reject) => {
    $fetch('/api/summaries/generateSummary', {
      method: 'POST',
      immediate: false,
      body: JSON.stringify({
        date: dateStore?.currentDate || date.value,
        title: data.title,
        description: data.description,
        use_ai: data.use_ai,
      }),
      async onResponse({ response }) {
        if (response.status !== 200) {
          reject(new Error(response._data.statusMessage))
          return
        }

        summary_modal.close()
        toast.add({
          severity: 'success',
          summary: 'Summary created',
          detail: 'Your summary was created successfully',
          group: 'br',
          life: 5000,
        })
        date.value = null
        resolve(response)
        refreshNuxtData('summaries')
        await navigateTo('/summaries')
      },
      onResponseError({ response }) {
        toast.add({
          severity: 'error',
          summary: 'Oh no!',
          detail: response._data.statusMessage,
          group: 'br',
          life: 5000,
        })

        reject(new Error(response._data.statusMessage))
        return
      },
    })
  })

  return res.then(() => res).catch((error) => console.error(error))
}
</script>
