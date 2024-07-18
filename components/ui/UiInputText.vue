<template>
  <div class="form-control relative w-full">
    <label v-if="props.label" class="label">
      <span class="label-text">{{ props.label }}</span>
    </label>
    <input
      ref="inputRef"
      v-bind="$attrs"
      type="text"
      :autofocus="props.autoFocus || null"
      :placeholder="props.placeHolder"
      :class="`${props.classes || 'input input-bordered w-full'}`"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <slot />
  </div>
</template>

<script setup>
const inputRef = ref(null)
defineEmits(['update:modelValue'])
const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  classes: {
    type: String,
  },
  placeHolder: {
    type: String,
    default: 'Type here',
  },
  autoFocus: {
    type: Boolean,
  },
  modelValue: {
    type: String,
  },
})

onMounted(() => {
  if (inputRef.value && props.autoFocus) {
    inputRef.value.focus()
  }
})
</script>
