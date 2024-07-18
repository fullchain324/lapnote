<template>
  <div
    class="tasks-container relative overflow-hidden bg-base-100 rounded-md pl-6 pb-6 pr-6"
  >
    <div
      class="flex sticky pt-6 z-20 bg-base-100 top-0 gap-2 justify-between items-center mb-4"
    >
      <h4 class="text-xl font-semibold tracking-tighter">
        {{ getTaskTitle }}
      </h4>
      <div class="create-task">
        <button
          @click="() => (addingTask = !addingTask)"
          :class="`btn btn-xl btn-circle ${
            addingTask ? 'btn-neutral text-neutral-content' : 'btn-primary'
          } m-1`"
        >
          <Icon
            :class="`transition-all ${
              addingTask ? 'transform rotate-[225deg]' : ''
            }`"
            name="material-symbols:add"
            size="24"
          />
        </button>
      </div>
    </div>
    <div
      v-auto-animate
      class="content-container min-h-[276px] max-h-[400px] overflow-y-auto overflow-x-hidden"
    >
      <template v-if="addingTask">
        <div
          class="w-full flex sticky top-0 gap-2 bg-base-100 z-[20] items-center mb-2 px-2 py-1"
        >
          <input type="checkbox" :checked="false" class="checkbox" disabled />
          <UiInputText
            @keyup.enter.prevent.stop="handleAddTask"
            :autoFocus="true"
            placeHolder="Your task title"
            v-model="newTask.title"
            classes="input input-sm input-bordered w-full"
          />
          <UiButton
            @click="handleAddTask"
            size="sm"
            kind="primary"
            extra-classes="!rounded-lg"
            ><Icon name="material-symbols:add" size="18"
          /></UiButton>
        </div>
      </template>
      <template
        v-if="
          shouldShowLoading &&
          !data?.not_completed?.length &&
          !data?.completed?.length
        "
      >
        <div class="grid place-content-center">
          <span class="loading loading-ball loading-lg"></span>
        </div>
      </template>
      <template v-else-if="data && data?.not_completed?.length">
        <template :key="group" v-for="group in data?.not_completed">
          <span
            v-if="group && group.goal"
            class="text-sm block mt-4 mb-2 font-semibold text-gray-700 dark:text-gray-300"
            >{{ group?.goal?.title }}</span
          >
          <template :key="task" v-for="task in group.tasks">
            <WidgetsTaskItem
              :task="task"
              :goal="group.goal"
              @editTask="(task, goal) => handleEdit(task, goal)"
              @deleteTask="(task) => handleDeleteTask(task, 'not_completed')"
            />
          </template>
        </template>
      </template>

      <template :key="dataCompleted" v-if="data && data?.completed?.length">
        <span class="mt-8 mb-4 block font-bold text-lg tracking-tighter"
          >Completed Tasks</span
        >
        <template :key="group" v-for="group in data?.completed">
          <span
            v-if="group && group.goal"
            class="text-sm block mt-4 mb-2 font-semibold text-gray-700 dark:text-gray-300"
            >{{ group?.goal?.title }}</span
          >
          <template :key="task" v-for="task in group.tasks">
            <WidgetsTaskItem
              :task="task"
              :goal="group.goal"
              @editTask="(task, goal) => handleEdit(task, goal)"
              @deleteTask="(task) => handleDeleteTask(task, 'completed')"
            />
          </template>
        </template>
      </template>

      <template
        v-if="
          !data?.not_completed?.length &&
          !data?.completed?.length &&
          !error &&
          !shouldShowLoading
        "
      >
        <WidgetsTasksEmpty
          @adding="addingTask = true"
          :addingTask="addingTask"
        />
      </template>
      <template v-else-if="error">
        {{ error }}
        <div>Error getting tasks..</div>
      </template>
    </div>
  </div>

  <UiModal id="task_modal">
    <template #title>
      <span>Edit task</span>
    </template>
    <template #default>
      <div class="task-edit">
        <UiInputText
          :autoFocus="true"
          label="Task title"
          v-model="currentTask.title"
        />
        <UiSeparator class="my-4" />
        <UiTextArea
          label="Task description"
          v-model="currentTask.description"
        />
        <UiSeparator class="my-4" />
        <UiGoalDropdown
          v-if="!taskGoal"
          direction="top"
          :allGoals="allGoals"
          @addGoal="($event) => handleAddGoal($event)"
        >
          <button
            :class="`btn btn-sm transition-all duration-500 transform m-1 ${
              buttonError
                ? 'btn-error text-error-content scale-[1.10]'
                : 'btn-outline scale-[1]'
            }`"
          >
            Add Goal
            <label>
              <Icon
                :class="`transition-transform duration-300 transform ${
                  buttonError ? 'rotate-[45deg]' : 'rotate-0 '
                }`"
                name="material-symbols:add"
                size="18"
              />
            </label>
          </button>
        </UiGoalDropdown>
        <button class="btn btn-sm btn-success flex gap-2" v-else>
          <span>{{ taskGoal.title }}</span>
          <Icon
            @click="handleRemoveGoal(taskGoal)"
            name="mdi:remove"
            size="18"
          />
        </button>
      </div>
    </template>

    <template #buttons>
      <div class="w-full justify-end flex gap-2">
        <button class="btn btn-sm btn-neutral" @click="close">Close</button>
      </div>
    </template>
  </UiModal>
  <Toast position="bottom-left" group="bl" />
</template>

<script setup>
import { useSelectedDate } from '#imports'
import { DateTime } from 'luxon'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const dateStore = useSelectedDate()
const shouldShow = ref(false)
const buttonError = ref(false)
const taskGoal = ref(null)
const currentTask = ref({
  title: '',
  description: '',
})

const { data: allGoals } = useFetch('/api/goals/getGoals', {
  key: 'goals',
})

// only add loading state
// if it's taking long (500ms +)
const { data, pending, error } = useAsyncData(
  'dailyTasks',
  () =>
    $fetch('/api/tasks/getGroupedTasks', {
      params: {
        date: dateStore?.currentDate || new Date(),
      },
    }),
  {
    watch: [dateStore],
    server: false,
    lazy: true,
  }
)
const { shouldShowLoading } = useLoading(pending, 750)

const getTaskTitle = computed(() => {
  const current = dateStore.currentDate
  if (Array.isArray(current)) {
    return `Tasks ${current[1] ? 'between' : 'for'} ${DateTime.fromISO(
      current[0]
    ).toFormat('dd MMM')} ${
      current[1] ? 'and ' + DateTime.fromISO(current[1]).toFormat('dd MMM') : ''
    }`
  }

  const today = new Date()
  const d = dateStore.currentDate ? new Date(dateStore.currentDate) : new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)

  if (today.toISOString() === d.toISOString()) {
    return `Today's Tasks`
  }

  return `Tasks for ${DateTime.fromISO(
    useGetISOStringFromDate(dateStore?.currentDate)
  ).toFormat('dd MMM')}`
})

onMounted(() => {
  shouldShow.value = true
})

const addingTask = ref(false)

const newTask = ref({
  title: null,
  description: null,
})

const handleAddTask = () => {
  $fetch('/api/tasks/createTask', {
    method: 'POST',
    body: JSON.stringify({
      title: newTask.value.title,
      description: newTask.description,
      createdAt: dateStore.currentDate || new Date(),
    }),
    onResponse({ response }) {
      if (response.status !== 200) return

      newTask.value = {
        title: null,
        description: null,
      }

      const toAdd = {
        goal: { title: 'No goal' },
        tasks: [response._data.tasks[0]],
      }

      // find the index of 'no goals'
      const idx = data.value.not_completed.findIndex(
        (f) => f.goal.title.toLowerCase() === 'no goal'
      )

      if (idx === -1) {
        data.value.not_completed = [toAdd, ...data.value.not_completed]
      } else {
        data.value.not_completed[idx].tasks.unshift(response._data.tasks[0])
      }

      toast.add({
        severity: 'success',
        summary: 'Done',
        detail: 'Task added',
        group: 'bl',
        life: 3000,
      })

      refreshNuxtData('tasksPage')
    },
    onResponseError({ error }) {
      console.error(error)

      refreshNuxtData('dailyTasks')
    },
  })
}

const handleEdit = (task, goal) => {
  currentTask.value = task
  goal.title.toLowerCase() !== 'no goal'
    ? (taskGoal.value = goal)
    : (taskGoal.value = null)

  task_modal.showModal()
}

const setButtonError = () => {
  buttonError.value = true

  setTimeout(() => {
    buttonError.value = false
  }, 1200)
}

const handleRemoveGoal = (goal) => {
  document.activeElement.blur()

  $fetch('/api/goals/removeGoal', {
    method: 'POST',
    body: JSON.stringify({
      goalId: goal.goalId,
      taskId: currentTask.value.id,
    }),
    onResponse({ response }) {
      if (response.status !== 200) return
      taskGoal.value = null

      refreshNuxtData('dailyTasks')
    },
    onResponseError() {
      setButtonError()
    },
  })
}

const handleAddGoal = (goal) => {
  if (currentTask?.value?.goalId === goal.goalId) {
    setButtonError()

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Cannot add duplicate goals',
      group: 'br',
      life: 3000,
    })

    document.activeElement.blur()

    return
  }
  $fetch('/api/goals/addGoal', {
    method: 'POST',
    body: JSON.stringify({
      goalId: goal.goalId,
      taskId: currentTask.value.id,
    }),
    onResponse({ response }) {
      if (response.status !== 200) return

      taskGoal.value = goal
      refreshNuxtData('dailyTasks')

      // toggles dropdown
      document.activeElement.blur()
    },
    onResponseError() {
      setButtonError()
    },
  })
}

const close = () => {
  taskGoal.value = null
  task_modal.close()
}

const handleDeleteTask = (task, kind) => {
  const taskIdToRemove = task.id

  for (const group of data.value[kind]) {
    group.tasks = group.tasks.filter((task) => task.id !== taskIdToRemove)

    if (!group.tasks.length) {
      // If the task array is empty, remove the goal
      const index = data.value[kind].indexOf(group)
      data.value[kind].splice(index, 1)
    }
  }
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
