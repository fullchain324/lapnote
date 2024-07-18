<template>
  <nav class="min-w-[288px] max-w-[288px] sticky top-5">
    <ul class="py-2">
      <template v-for="activity in menuActivities">
        <NuxtLink :to="activity.link">
          <button
            :class="`transition-all w-full hover:bg-base-300 hover:text-base-content
          px-4 py-3 mb-2 rounded-md ${shouldHighlight(activity)}`"
          >
            <div class="flex gap-2 items-center">
              <Icon :name="activity.icon" size="20" />
              <span class="block">
                {{ activity.name }}
              </span>
            </div>
          </button>
        </NuxtLink>
      </template>
    </ul>
  </nav>
</template>

<script setup>
const route = useRoute()

const menuActivities = [
  {
    id: 0,
    name: 'Home',
    icon: 'iconamoon:home-bold',
    link: '/',
  },
  {
    id: 1,
    name: 'Activities',
    icon: 'lucide:text',
    link: '/activities',
  },
  {
    id: 2,
    name: 'Goals',
    icon: 'octicon:goal-16',
    link: '/goals',
  },
  {
    id: 3,
    name: 'Tasks',
    icon: 'lucide:list-todo',
    link: '/tasks?filter=all',
  },
  {
    id: 4,
    name: 'Summaries',
    icon: 'system-uicons:window-content',
    link: '/summaries',
  },
]

const shouldHighlight = (activity) => {
  if (activity.link === '/') {
    if (route.path === activity.link) {
      return 'font-bold bg-primary text-primary-content hover:bg-primary hover:text-primary-content focus:ring focus:ring-primary/50'
    } else {
      return
    }
  }

  if (route.path.indexOf(activity.link.split('?')[0]) > -1) {
    return 'font-bold bg-primary text-primary-content hover:bg-primary hover:text-primary-content focus:ring focus:ring-primary/50'
  }
}
</script>
