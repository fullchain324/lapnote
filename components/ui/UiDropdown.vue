<template>
  <div class="dropdown">
    <label class="dd-label flex items-center justify-between">
      <slot name="label"></slot>
    </label>
    <ul
      tabindex="0"
      class="dropdown-content z-[1] capitalize mt-4 menu border border-base-300 bg-base-100 p-2 shadow-xl rounded-box w-52"
    >
      <li class="text-xs border-b dark:border-neutral p-2 mb-2 font-semibold">
        {{ dropdownLabel }}
      </li>
      <template v-if="list && list.length">
        <li @click="handleClick(element)" v-for="element in list">
          <a class="no-underline">
            {{ element[nameKey] }}
          </a>
        </li>
      </template>
      <template v-else-if="!list || !list.length">
        <slot name="empty-list"></slot>
      </template>
    </ul>
  </div>
</template>

<script setup>
const emit = defineEmits(['change'])
const props = defineProps({
  list: {
    type: Array,
    default: [],
  },
  dropdownLabel: {
    type: String,
    default: 'Select',
  },
  nameKey: {
    type: String,
    default: 'title',
  },
})

const handleClick = (e) => {
  emit('change', e)

  document.activeElement.blur()
}
</script>
