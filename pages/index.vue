<template>
  <div>
    <WidgetsAddActivity />
    <UiSeparator class="my-8" />
    <WidgetsActivityRepeater :date="true" queryKey="dailyActivities" />
    <UiSeparator class="my-8" />
  </div>
</template>
