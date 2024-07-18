<template>
  <div class="form-control relative w-full">
    <label v-if="props.label" class="label">
      <span class="label-text">{{ props.label }}</span>
    </label>
    <textarea
      ref="inputRef"
      v-bind="$attrs"
      @input="$emit('update:modelValue', $event.target.value)"
      :autofocus="props.autoFocus || null"
      :class="`${props.classes || 'input input-bordered w-full'}`"
      :value="modelValue"
      class="textarea textarea-bordered h-24"
      :placeholder="props.placeHolder"
    ></textarea>
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
