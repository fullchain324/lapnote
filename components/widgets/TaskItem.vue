<template>
  <Transition name="fade">
    <div
      v-show="show && currentTask"
      @mouseenter="showDelete(true)"
      @mouseleave="showDelete(false)"
      :class="`transition-all duration-300 w-full relative px-2 py-1
    hover:bg-neutral dark:hover:bg-base-300 border-b border-base-300 dark:border-neutral/30 overflow-hidden
    hover:text-base-200-content flex
    gap-2 items-center
    ${currentTask.completed ? 'opacity-60' : 'opacity-100 bg-transparent'}
    `"
    >
      <Transition name="slide-fade">
        <div
          v-if="showDeleteIcon && !currentTask.completed"
          class="task-buttons absolute flex gap-0 items-center transition-all right-1 transform z-10"
        >
          <button
            @click="handleEditTask"
            class="btn btn-circle btn-sm btn-ghost"
          >
            <Icon name="material-symbols:edit-outline" size="18" />
          </button>
          <button
            :class="`btn transition-all ${
              confirmDelete
                ? 'btn-xl bg-red-500 !rounded-none !right-0 hover:bg-red-600 text-white hover:text-white'
                : 'btn-circle btn-sm btn-ghost'
            } `"
            @click="handleDelete"
          >
            <Icon name="mingcute:delete-line" size="18" />
          </button>
        </div>
      </Transition>

      <input
        type="checkbox"
        @change="handleTaskstate"
        v-model="currentTask.completed"
        :checked="currentTask.completed"
        class="checkbox z-[10] checkbox-primary"
      />
      <UiInputText
        @focus="editing.value = true"
        @blur="editing = false"
        v-model="currentTask.title"
        @update:modelValue="handleEditing"
        :classes="`${
          currentTask.completed ? 'pointer-events-none' : ''
        } input input-sm input-ghost !px-2 max-w-[250px] !outline-0 bg-transparent`"
      >
        <Transition name="test">
          <span
            v-if="
              getTaskAge(currentTask) > 0 &&
              !showDeleteIcon &&
              !currentTask.completed
            "
            :class="`${getBackgroundClass(
              getTaskAge(currentTask)
            )} text-[12px] dark:text-white/50 font-bold uppercase mt-0 ml-auto text-neutral-content/60 absolute right-0 top-1/2 -translate-y-1/2 transform`"
          >
            {{ getTaskAge(currentTask) }}d
          </span>
        </Transition>

        <Transition
          @after-enter="handleAnimation(_, _, 'enter')"
          @leave="(e, done) => handleAnimation(e, done, 'leave')"
          :css="false"
          appear
        >
          <div
            ref="strike"
            v-show="currentTask.completed"
            :class="`strike bg-black dark:bg-white/50 z-[9] h-[1px]
          absolute top-1/2 transform-translate-y-1/2`"
          />
        </Transition>
      </UiInputText>
    </div>
  </Transition>
  <Toast position="bottom-left" group="bl" />
</template>

<script setup>
import { gsap } from 'gsap'
import { useDebounceFn } from '@vueuse/core'
import { DateTime, Interval } from 'luxon'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const confirmDelete = ref(false)
const props = defineProps({
  task: {
    type: Object,
    default: null,
  },
  goal: {
    type: Object,
    default: {},
  },
})
const currentTask = reactive(
  props.task || {
    title: '',
    completed: false,
  }
)
const currentGoal = ref(props.goal || null)
const show = ref(false)
const showDeleteIcon = ref(false)
const invertedAnimation = ref(false)
const tween = ref(null)
const editing = ref(false)

const strike = ref('strike')
const emit = defineEmits(['deleteTask', 'editTask'])

onMounted(() => {
  show.value = true

  if (currentTask.completed) {
    invertedAnimation.value = true
  }
  tween.value = invertedAnimation.value
    ? gsap.from(strike.value, {
        width: '100%',
        paused: true,
        ease: 'power1.out',
      })
    : gsap.to(strike.value, { width: '100%', paused: true, ease: 'power1.out' })
})

const updateFn = (timeout = 1000, type = '') =>
  useDebounceFn(() => {
    // add a saving indicator
    currentTask.completed_at = new Date()
    currentTask.updated_at = new Date()
    $fetch('/api/tasks/updateTasks', {
      method: 'POST',
      body: JSON.stringify(currentTask),
      onResponseError({ response }) {
        toast.add({
          severity: 'error',
          summary: 'Oh no!',
          detail: response._data.statusMessage,
          group: 'bl',
          life: 5000,
        })
      },
      onResponse({ response }) {
        if (response.status !== 200) return

        refreshNuxtData('goals')
      },
    })
  }, timeout)

const handleEditing = updateFn()
const handleTaskstate = updateFn(0)

const handleDelete = () => {
  if (!confirmDelete.value) {
    confirmDelete.value = true

    return
  }

  $fetch('/api/tasks/deleteTask', {
    method: 'POST',
    body: JSON.stringify(currentTask),
    onResponse({ response }) {
      if (!response.status === 200) return

      emit('deleteTask', currentTask)
      refreshNuxtData('tasksPage')

      confirmDelete.value = false
    },
    onResponseError({ error }) {
      console.error(error)

      refreshNuxtData('dailyTasks')
    },
  })
}

const handleAnimation = (_, done, type) => {
  if (!tween.value) return

  if (type === 'enter') {
    invertedAnimation.value ? tween.value.reverse() : tween.value.play(0)

    return
  }

  invertedAnimation.value ? tween.value.play(0) : tween.value.reverse()

  setTimeout(() => {
    done()
  }, 500)
}

const showDelete = (value) => {
  showDeleteIcon.value = value
  confirmDelete.value = false
}

const handleEditTask = () => {
  emit('editTask', currentTask.value || currentTask, currentGoal.value)
}

const getDiff = (start, end) => {
  const d = Interval.fromDateTimes(end, start)
  return Math.trunc(d.length('days'))
}

const getTaskAge = (current) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let start = DateTime.fromISO(today.toISOString())
  let end = DateTime.fromISO(current.created_at)

  const diff = getDiff(start, end)

  return diff
}

const getBackgroundClass = (day) => {
  let color = null

  switch (true) {
    case day >= 2 && day <= 4:
      color = 'text-warning'
      break
    case day >= 5:
      color = 'text-error'
      break
  }

  return color || ''
}
</script>

<style>
.slide-fade-enter-active {
  transition: all 0.2s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

.test-enter-from,
.test-leave-to {
  opacity: 0;
}
.test-enter-active {
  transition: all 0.2s ease-out;
  transition-delay: 0.2s;
}
</style>
