<template>
  <div class="goals">
    <div class="heading flex justify-between">
      <h1 class="text-xl font-semibold tracking-tighter">Goals</h1>
      <UiButton kind="primary" @click="handleCreate">Create goal</UiButton>
    </div>
    <UiSeparator class="mb-4" />

    <div v-if="pending && !data" class="grid place-content-center">
      <span class="loading loading-dots loading-lg"></span>
    </div>
    <div v-if="error">error...</div>
    <div v-if="data">
      <div v-if="!data.length">
        <p>You haven't created any goals</p>
        <UiSeparator class="my-4" />
      </div>
      <div v-else>
        <UiSeparator class="my-8" />
        <div
          class="goals h-full grid grid-cols-1 lg:grid-cols-2 items-stretch gap-4"
        >
          <div
            @mouseenter="showDelete(i)"
            @mouseleave="showDelete(false)"
            class="goal h-full w-full relative"
            v-for="(goal, i) in data"
          >
            <div class="delete absolute z-[900] right-2 top-2">
              <div v-if="showDeleteIcon === i">
                <button
                  :class="`btn btn-sm transition-all`"
                  @click="() => handleDelete(goal)"
                >
                  <Icon name="mingcute:delete-line" size="18" />
                </button>
              </div>
            </div>

            <NuxtLink :to="`/goals/${goal.goalId}?name=${goal.title}`">
              <button
                class="transition-all duration-500 card rounded-md text-left min-h-[180px] min-w-[180px] w-full dark:hover:bg-base-300 dark:hover:border-white dark:hover:text-white hover:bg-base-200 border border-base-300 dark:border-neutral/50"
                :class="`${
                  Number(goal.completed_tasks) === Number(goal.total_tasks) &&
                  Number(goal.completed_tasks) !== 0
                    ? 'bg-gradient-to-tl from-success/40 dark:from-success/80 border-success dark:border-success to-base-100'
                    : 'bg-gradient-to-br from-transparent to-base-300'
                }`"
              >
                <div class="card-body w-full relative">
                  <h2 class="card-title text-lg font-semibold tracking-tighter">
                    {{ goal.title }}
                  </h2>
                  <p class="text-sm text-black/70 dark:text-white/60">
                    {{ goal.description }}
                  </p>
                  <div
                    class="counts w-full flex flex-wrap gap-2 justify-between"
                  >
                    <div
                      class="tasks-count w-full rounded-md flex justify-between items-center"
                    >
                      <span class="text-sm capitalize block">tasks</span>
                      <span class="font-bold text-md"
                        >{{ goal.completed_tasks }}
                        /
                        {{ goal.total_tasks }}
                      </span>
                    </div>
                    <div
                      class="activities-count w-full rounded-md flex justify-between items-center"
                    >
                      <span class="text-sm capitalize block">activities</span>
                      <span class="font-bold text-md">
                        {{ goal.total_activities }}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <UiModal
      id="goal_modal"
      @close="useQueryRoute('remove', 'goal_modal_open')"
    >
      <template #title>
        <div>Create goal</div>
      </template>
      <template #default>
        <div>
          <UiInputText
            :autoFocus="true"
            label="Goal title"
            v-model="goal.title"
          />
          <UiSeparator class="my-4" />
          <UiInputText label="Goal description" v-model="goal.description" />
        </div>
      </template>

      <template #buttons>
        <div class="w-full justify-end flex gap-2">
          <button @click="handleCancel" class="btn btn-sm btn-ghost">
            cancel
          </button>
          <button class="btn btn-sm btn-success" @click="createGoal">
            Create Goal
          </button>
        </div>
      </template>
    </UiModal>
  </div>

  <UiModal id="delete_modal">
    <template #title> Deleting goal </template>
    <template #default> The goal will be lost, are you sure? </template>
    <template #buttons>
      <button @click="closeModal" class="btn btn-ghost btn-sm">cancel</button>
      <button class="btn btn-error btn-sm" @click="deleteGoal">
        Delete Goal
      </button>
    </template>
  </UiModal>
</template>

<script setup>
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const { currentRoute } = router
const toast = useToast()
const showDeleteIcon = ref(false)
const currentlySelectedGoal = ref(null)

const { data, pending, error } = useFetch('/api/goals/getGoals', {
  key: 'goals',
})

const showDelete = (value) => {
  showDeleteIcon.value = value
}

const goal = ref({
  title: '',
  description: '',
  content: '',
})

const handleCreate = () => {
  goal_modal.showModal()
  useQueryRoute('add', 'goal_modal_open', 'true')
}

const handleDelete = (goal) => {
  currentlySelectedGoal.value = goal
  delete_modal.showModal()
}

const deleteGoal = async () => {
  if (!currentlySelectedGoal.value) return

  await $fetch('/api/goals/deleteGoal', {
    method: 'POST',
    body: JSON.stringify({
      id: currentlySelectedGoal.value.goalId,
    }),
    onResponse({ response }) {
      if (response.status !== 200) return
      currentlySelectedGoal.value = null

      delete_modal.close()
      toast.add({
        severity: 'success',
        summary: 'Goal deleted',
        detail: 'Your goal was deleted successfully',
        group: 'br',
        life: 5000,
      })

      refreshNuxtData('goals')
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

const resetData = () => {
  goal.value = {
    title: '',
    description: '',
    content: '',
  }
}

const handleCancel = () => {
  goal_modal.close()
  resetData()
}

const createGoal = () => {
  $fetch('/api/goals/createGoal', {
    method: 'POST',
    body: JSON.stringify(goal.value),
    onResponse() {
      refreshNuxtData('goals')
      goal_modal.close()
      resetData()
    },
  })
}

onMounted(() => {
  if (!!currentRoute.value.query.goal_modal_open) {
    goal_modal.showModal()
  }
})

const closeModal = () => {
  delete_modal.close()
}
</script>
