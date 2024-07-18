<template>
  <div class="search-input relative">
    <UiInputText
      classes="px-8 py-2 rounded-md input-bordered input"
      :auto-focus="true"
      place-holder="Search"
    />
    <Icon
      class="absolute left-2 top-1/2 transform -translate-y-1/2"
      name="gridicons:search"
      size="24"
    />
  </div>
</template>

<script setup>
const isSearching = ref(false)
</script>
