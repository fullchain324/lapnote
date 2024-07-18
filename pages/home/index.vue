<template>
  <section
    class="w-screen dark:bg-black bg-white h-[80dvh] grid grid-cols-1 place-content-center"
  >
    <div
      class="main-hero-content mx-auto max-w-[1200px] px-2 xl:px-0 gap-2 w-full justify-between flex items-center"
    >
      <div class="app-info w-full flex-1">
        <h1
          class="text-8xl font-extrabold tracking-tighter text-black dark:text-white"
        >
          Notelap
        </h1>
        <p class="mt-2 max-w-[400px] font-semibold">
          Log work things, personal things and everything in between - it's the
          perfect tool for disorganised people
        </p>
        <UiSeparator class="my-4" />
        <div class="buttons flex flex-wrap items-center gap-2">
          <div v-if="status === 'unauthenticated'">
            <UiButton kind="primary" @click="signIn('google')"
              >get started</UiButton
            >
          </div>
          <UiButton kind="secondary">another</UiButton>
        </div>
      </div>
      <div class="w-full flex-1">Other</div>
    </div>
  </section>
  <main class="bg-black">
    <div class="cont max-w-[1200px] mx-auto px-4 xl:px-0">
      <div
        class="cards relative grid grid-cols-1 lg:grid-cols-2 gap-4 py-[4rem]"
      >
        <div
          class="backdrop-element bg-blue-500/40 z-1 blur-[200px] absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 w-[70dvw] h-[60dvh]"
        />
        <div
          class="backdrop-inner bg-white blur-3xl mix-blend-overlay z-2 absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 w-[60dvw] h-[40dvh]"
        />
        <div
          class="home-card relative w-full h-full rounded-3xl transition duration-500 hover:before:opacity-100"
          v-for="(card, i) in cards"
          @mousemove="(e) => handleMouseMove(e, i)"
          :style="`--x: ${card.x}px; --y: ${card.y}px;`"
        >
          <div
            class="group relative w-full duration-500 transition-all overflow-hidden rounded-3xl border border-white/20 hover:border-transparent bg-gradient-to-tr from-black/60 to-black/40 hover:from-black/60 hover:to-black/40"
          >
            <div class="m-6 min-h-[330px] w-full sm:m-10 md:min-h-[450px]">
              <h3 class="text-2xl mb-4 font-bold">{{ card.name }}</h3>
              <p>{{ card.description }}</p>
              {{ card.x }} {{ card.y }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
<script setup>
const { status, data, signIn, signOut } = useAuth()
import { gsap } from 'gsap'

const handleMouseMove = (e, i) => {
  const rect = e.target.getBoundingClientRect()
  cards[i].x = e.clientX - rect.left
  cards[i].y = e.clientY - rect.top
}

definePageMeta({
  layout: 'marketing',
})

const cards = reactive([
  {
    id: 0,
    name: 'Nice',
    description: 'do this and this and this',
    x: 0,
    y: 0,
  },
  {
    id: 1,
    name: 'Nice 2',
    description: 'do this and this and this',
    x: 0,
    y: 0,
  },
])
</script>

<style>
.home-card:before {
  background: radial-gradient(
    2500px circle at var(--x) var(--y),
    #2c74b8 0,
    #1c2a7b 25%,
    hsla(0, 0%, 100%, 0) 50%,
    transparent 80%
  );
  z-index: 0;
  content: '';
  inset: -1px;
  pointer-events: none;
  position: absolute;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  opacity: 0;
  border-radius: 1.5rem;
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 0.3s;
  animation-duration: 0.3s;
}
</style>
