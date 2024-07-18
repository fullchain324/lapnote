<template>
  <div class="tasks">
    <div class="heading flex justify-between">
      <h1 class="text-xl font-semibold tracking-tighter">Tasks</h1>
      <UiButton
        @click="() => handleModalOpen('create')"
        kind="primary"
        class="add-new"
        >Create task
      </UiButton>
    </div>
    <UiFilters :filters="taskFilters" />
    <UiSeparator class="my-8" />

    <template v-if="!data?.tasks?.length && !error">
      <WidgetsTasksEmpty @adding="handleModalOpen" />
    </template>

    <div v-auto-animate ref="taskContainer" class="tasks-body">
      <div :key="task.id" v-for="task in data?.tasks">
        <div
          class="w-full text-left flex items-center rounded-none relative gap-3 hover:bg-base-300 px-5 py-0 border-b border-base-300 dark:border-neutral/30"
          :class="`${task.completed ? 'opacity-50' : ''}`"
        >
          <div class="edit absolute right-2 top-2">
            <UiDropdown
              :list="actions"
              nameKey="name"
              @change="(e) => handleAction(e, task)"
              :dropdownLabel="'Edit Task'"
            >
              <template #label>
                <UiButton kind="ghost" size="sm">
                  <Icon name="tabler:dots" size="18" />
                </UiButton>
              </template>
            </UiDropdown>
          </div>
          <input
            type="checkbox"
            @change="() => handleTaskstate(task)"
            v-model="task.completed"
            :checked="task.completed"
            class="checkbox z-[10] checkbox-primary"
          />
          <div
            @click="() => handleEdit(task)"
            class="title-desc w-full py-3 cursor-pointer"
          >
            <span class="block text-sm">{{ task.title }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <UiModal @close="handleCloseModal" id="add_task">
    <template #title>{{ editing ? 'Edit task' : 'Add task' }}</template>
    <template #default>
      <FormKit
        id="task_form"
        @submit="(e) => submitHandler(e, editing ? 'edit' : 'add')"
        type="form"
        :submit-attrs="{
          inputClass: 'btn btn-success',
        }"
        :submit-label="editing ? 'Edit task' : 'Add task'"
        v-model="formData"
      >
        <FormKit
          id="title-input"
          validation="required:trim|length:0, 50"
          type="text"
          name="title"
          label="Title"
        />
        <FormKit type="textarea" name="description" label="Description" />

        <template v-if="goalData?.length">
          <FormKit
            type="select"
            name="goals"
            placeholder="Select a goal"
            label="Goal"
            :options="formatGoalData"
          />
        </template>
      </FormKit>
    </template>
  </UiModal>
  <Toast position="bottom-right" group="br" />
</template>

<script setup>
import { useToast } from 'primevue/usetoast'
import { getNode, reset } from '@formkit/core'

const taskContainer = ref(null)
const formData = ref(null)
const pageOffset = ref(0)
const pageLimit = ref(20)
const toast = useToast()
const router = useRouter()
const editing = ref(null)
const { currentRoute } = router
const currentFilter = ref(useQueryRoute('get')?.filter || 'all')

const { data, pending, error } = useFetch('/api/tasks/getTasks', {
  key: 'tasksPage',
  params: {
    limit: pageLimit.value,
    offset: pageOffset.value,
    filter: currentFilter.value,
    orderBy: '',
  },
})

const handleDelete = (task) => {
  $fetch('/api/tasks/deleteTask', {
    method: 'POST',
    body: JSON.stringify({
      id: task.id,
    }),
    onResponse({ response }) {
      if (response.status !== 200) return
      data.value.tasks = data.value.tasks.filter((f) => f.id !== task.id)
      toast.add({
        severity: 'success',
        summary: 'Done',
        detail: 'Task deleted',
        group: 'br',
        life: 3000,
      })
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

const actions = [
  {
    name: 'Delete',
  },
]

const handleAction = (element, task) => {
  switch (true) {
    case element.name === 'Edit':
      handleEdit(task)
      break
    case element.name === 'Delete':
      handleDelete(task)
      break
  }
}

const { data: goalData } = useFetch('/api/goals/getGoals')

const formatGoalData = computed(() => {
  if (!goalData.value || !goalData.value.length) return []

  return [...goalData.value].map((m) => {
    return {
      label: m.title,
      value: m.goalId.toString(),
    }
  })
})

const handleTaskstate = (task) => {
  const newTask = { ...task }
  $fetch('/api/tasks/updateTasks', {
    method: 'POST',
    body: JSON.stringify(newTask),
    onResponseError({ response }) {
      toast.add({
        severity: 'error',
        summary: 'Oh no!',
        detail: response._data.statusMessage,
        group: 'br',
        life: 3000,
      })
    },
    onResponse({ response }) {
      if (response.status !== 200) return
      const modifiedTask = response._data[0]

      data.value.tasks = data.value.tasks.filter(
        (f) => f.id !== modifiedTask.id
      )

      if (modifiedTask.completed) {
        const idx = data.value.tasks.findIndex((f) => f.completed)
        data.value.tasks.splice(idx, 0, modifiedTask)
      } else {
        data.value.tasks.unshift(modifiedTask)
      }
      // refreshNuxtData('dailyTasks')
    },
  })
}

onMounted(async () => {
  if (!!currentRoute.value.query.task_modal_open) {
    add_task.showModal()
    await nextTick()
    useFocus('title-input')
  }
})

const submitHandler = (formData, type) => {
  const res = new Promise((resolve, reject) => {
    $fetch(
      `${type === 'add' ? '/api/tasks/createTask' : '/api/tasks/updateTasks'}`,
      {
        method: 'POST',
        immediate: false,
        body: JSON.stringify({
          id: editing.value ? Number(editing.value) : '',
          title: formData.title,
          description: formData.description,
          created_at: new Date(),
          goalId: formData.goals,
        }),
        async onResponse({ response }) {
          if (response.status !== 200) {
            reject(new Error(response._data.statusMessage))
            return
          }

          const action = type === 'add' ? 'created' : 'updated'

          toast.add({
            severity: 'success',
            summary: `Task ${action}`,
            detail: `Your task was ${action} successfully`,
            group: 'br',
            life: 5000,
          })

          if (type === 'add') {
            if (data.value?.tasks?.length) {
              data.value.tasks = data.value?.tasks?.length
                ? [response._data.tasks[0], ...data.value.tasks]
                : response._data
            } else {
              data.value = response._data
            }
          } else {
            const idx = data.value.tasks.findIndex(
              (f) => f.id === editing.value
            )
            data.value.tasks[idx] = response._data[0]
          }

          resolve(response)

          handleCloseModal()

          refreshNuxtData('dailyTasks')
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
      }
    )
  })
  return res.then(() => res).catch((error) => console.error(error))
}

const handleModalOpen = (type) => {
  add_task.showModal()
  useQueryRoute('add', 'task_modal_open', 'true')
  useFocus('title-input')
}

const handleEdit = (task) => {
  editing.value = task.id
  formData.value = {
    title: task.title,
    description: task.description,
    goals: task.goal_id,
  }

  add_task.showModal()
}

const handleCloseModal = async () => {
  console.log('t', getNode('task_form'))
  console.log('test', document.getElementById('task_form'))
  // getNode('task_form').reset()

  editing.value = null

  await nextTick()
  add_task.close()

  useQueryRoute('remove', 'task_modal_open')
}

const filterQuery = async (action) => {
  const current = useQueryRoute('get')

  if (action === current.filter) {
    return
  }

  useQueryRoute('remove', 'filter')
  useQueryRoute('add', 'filter', action)

  data.value = await $fetch('/api/tasks/getTasks', {
    method: 'GET',
    query: {
      filter: action,
    },
  })
}

const taskFilters = [
  {
    name: 'All',
    param: 'all',
    fn: () => filterQuery('all'),
  },
  {
    name: 'Completed',
    param: 'completed',
    fn: () => filterQuery('completed'),
  },
  {
    name: 'Not Completed',
    param: 'not_completed',
    fn: () => filterQuery('not_completed'),
  },
]
</script>
