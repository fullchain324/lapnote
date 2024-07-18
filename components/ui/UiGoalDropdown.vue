<template>
  <div :class="`dropdown ${direction}`">
    <ClientOnly>
      <slot />
    </ClientOnly>
    <ul
      tabindex="0"
      class="dropdown-content z-[1] menu border border-base-300 bg-base-100 p-2 shadow-xl rounded-box w-52"
    >
      <li class="text-xs border-b dark:border-neutral pb-2">Select a goal</li>
      <template v-if="props.allGoals?.length" v-for="goal in props.allGoals">
        <li @click="$emit('addGoal', goal)">
          <a class="no-underline">
            {{ goal?.title }}
          </a>
        </li>
      </template>
      <template v-else>
        <NuxtLink to="/goals"
          ><li><a>Create goal</a></li></NuxtLink
        >
      </template>
    </ul>
  </div>
</template>

<script setup>
const props = defineProps({
  direction: {
    type: String,
    default: 'dropdown-bottom',
  },
  allGoals: {
    type: Object,
    default: null,
  },
})

const direction = ref('')

const computeDirection = () => {
  if (!props.direction) {
    direction.value = 'dropdown-bottom'
  }

  direction.value = `dropdown-${props.direction}`
}

onMounted(() => {
  computeDirection()
})
</script>
