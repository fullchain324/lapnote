<template v-if="status === 'authenticated'">
  <!-- handle mobile later, have different layouts -->
  <LayoutHeader />
  <UiSeparator class="mb-4" />
  <div class="content-layout font-poppins flex items-start w-full">
    <LayoutLeftSidebar v-if="!isMobile" class="px-4" />
    <LayoutMainContent class="flex-1">
      <slot />
    </LayoutMainContent>
    <LayoutRightSidebar v-if="!isMobile" class="min-w-[450px] max-w-[450px]" />
  </div>
  <div
    v-if="isMobile"
    class="bottom-menu border-t border-primary/10 z-20 bottom-0 fixed h-[98px] bg-base-300 w-full"
  >
    <div class="buttons flex gap-3 h-full">
      <button
        @click="item.clickFn ? item.clickFn() : null"
        class="w-full h-full hover:bg-black hover:text-primary grid pb-8 place-content-center text-center"
        v-for="item in menuItems"
      >
        <Icon :name="item.icon" size="32" />
      </button>
    </div>
  </div>

  <template v-if="isMobile">
    <Transition name="slide-fade">
      <aside
        v-if="menuOpen"
        class="z-10 w-full py-16 px-4 h-screen left-0 top-0 bg-base-200 fixed"
      >
        <button class="absolute right-5 top-5" @click="menuOpen = false">
          <Icon name="material-symbols:close" size="32" />
        </button>

        <template v-if="currentOpen">
          <div v-if="currentOpen === 'calendar'">
            <Calendar inline />
            {{ currentOpen }}
          </div>
        </template>
      </aside>
    </Transition>
  </template>
</template>

<script setup>
const { status } = useAuth()
const isMobile = useDevice()

const menuOpen = ref(false)
const currentOpen = ref('')

onBeforeMount(async () => {
  if (status.value !== 'authenticated') {
    await navigateTo('/home')
  }
})

const openMenu = (type) => {
  menuOpen.value = true
  currentOpen.value = type
}

const closeHome = () => {
  menuOpen.value = false
}

const menuItems = [
  {
    id: 0,
    name: 'Home',
    icon: 'iconamoon:home-bold',
    clickFn: closeHome,
  },
  {
    id: 1,
    name: 'Calendar',
    icon: 'octicon:calendar-16',
    clickFn: () => openMenu('calendar'),
  },
  {
    id: 2,
    name: 'Menu',
    icon: 'mingcute:menu-fill',
    clickFn: () => openMenu('menu'),
  },
]
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
