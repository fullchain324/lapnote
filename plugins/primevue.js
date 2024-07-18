import { defineNuxtPlugin } from "#app"
import PrimeVue from "primevue/config"
import Calendar from "primevue/calendar"
import ToastService from 'primevue/toastservice'
import Toast from 'primevue/toast'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, { ripple: true })
  nuxtApp.vueApp.use(ToastService)
  nuxtApp.vueApp.component("Calendar", Calendar)
  nuxtApp.vueApp.component("Toast", Toast)
  //other components that you need
})