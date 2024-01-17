import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

import { createApp } from 'vue'
import { createPinia } from 'pinia'


import dayjs from "dayjs";
import  plugin  from 'dayjs/plugin/customParseFormat'
dayjs.extend(plugin)

import VueSweetAlert from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'


import Popper from "vue3-popper";

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueSweetAlert)
app.component("PopperWidget", Popper);

app.config.globalProperties.$dayjs = dayjs;

app.mount('#app')
