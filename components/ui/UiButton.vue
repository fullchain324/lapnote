<template>
  <button class="btn !normal-case" :class="computedClasses">
    <template v-if="currentState === 'loading'">
      <span class="loading loading-spinner"></span>
      <span v-if="loadingMessage">
        {{ loadingMessage }}
      </span>
      <span v-else> Loading </span>
    </template>
    <template v-else-if="currentState === 'error'">
      <Icon name="mi:circle-error" size="24" />
      Error
    </template>
    <template v-else-if="currentState === 'done'">
      <Icon name="material-symbols:done" size="24" />
      Done!
    </template>
    <template v-else>
      <slot />
    </template>
  </button>
</template>

<script setup>
const props = defineProps({
  kind: {
    type: String,
    default: 'btn-neutral',
    validator(value) {
      // The value must match one of these strings
      return [
        'neutral',
        'primary',
        'secondary',
        'accent',
        'outline',
        'success',
        'ghost',
        'link',
      ].includes(value)
    },
  },
  size: {
    type: String,
    default: '',
    validator(value) {
      // The value must match one of these strings
      return ['xs', 'sm', 'lg', '', 'wide'].includes(value)
    },
  },
  extraClasses: {
    type: String,
    default: '',
  },
  state: {
    type: String,
    validator(value) {
      return ['loading', 'error', 'done', '', null].includes(value)
    },
  },
  loadingMessage: {
    type: String,
  },
})

const currentState = ref(props.state)

watch(
  () => props.state,
  () => {
    if (props.state === 'done' || props.state === 'error') {
      currentState.value = props.state
      setTimeout(() => {
        currentState.value = null
      }, 3000)

      return
    }
    currentState.value = props.state
  },
  {
    deep: true,
  }
)

const computedClasses = computed(() => {
  if (currentState.value === 'error') {
    return 'btn-error text-error-content'
  }

  const buttonVariants = {
    kind: {
      primary: 'btn-primary',
      neutral: 'btn-neutral',
      secondary: 'btn-secondary',
      accent: 'btn-accent',
      success: 'btn-success',
      outline: 'btn-outline',
      ghost: 'btn-ghost',
      link: 'btn-link',
    },
    size: {
      xs: 'btn-xs',
      sm: 'btn-sm',
      lg: 'btn-lg',
      wide: 'btn-wide',
    },
  }

  const toCheck = [
    { key: 'kind', value: props.kind },
    { key: 'size', value: props.size },
  ]

  const classes = []

  toCheck.forEach((prop) => {
    prop ? classes.push(buttonVariants[prop.key][prop.value]) : ''
  })

  if (currentState.value === 'loading') {
    classes.push('pointer-events-none opacity-50')
  }

  return (
    classes.join(' ') + (props.extraClasses ? ' ' + props.extraClasses : '')
  )
})
</script>
