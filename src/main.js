import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'


import VueShepherdPlugin from 'vue-shepherd';
import 'shepherd.js/dist/css/shepherd.css';

import VueGtag from "vue-gtag";

import { createApp } from 'vue'
import { createPinia } from 'pinia'


import dayjs from 'dayjs'
import plugin from 'dayjs/plugin/customParseFormat'
import Clarity from '@microsoft/clarity';


dayjs.extend(plugin)

import VueSweetAlert from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'


import Vue3Toastify from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import VCalendar from 'v-calendar'
import 'v-calendar/style.css'

import VResizable from 'v-resizable'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faChevronLeft, faChevronRight,
  faSearch, faTimes,
  faPrint, faCopy, faPencil,
  faEye, faEyeSlash,
  faCheck,
  faPlus,
  faCalendar,
  faUsers, faBuilding, faListCheck, faFileText, faUser, faBan, faCheckSquare
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faChevronLeft, faChevronRight,
  faSearch, faTimes,
  faPrint, faCopy, faPencil,
  faEye, faEyeSlash,
  faCheck, faCheckSquare,
  faPlus,faCalendar, faUsers,
  faBuilding, faListCheck, faFileText, faUser, faBan
)

import Popper from 'vue3-popper'

import App from './App.vue'
import router from './router'
import { createI18n } from 'vue-i18n'


import localeEn from './locale/en.json'
import localeAz from './locale/az.json'
import localeDe from './locale/de.json'
import localeTr from './locale/tr.json'
import localeRu from './locale/ru.json'
import CoreuiVue from '@coreui/vue'

const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';

const i18n = createI18n({
  locale: savedLanguage,
  fallbackLocale: 'en',
  legacy: false,
  messages: {
    en: localeEn,
    de: localeDe,
    az: localeAz,
    tr: localeTr,
    ru: localeRu
  }
})

const projectId = "tdp6bxyd7n";
Clarity.init(projectId);

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueSweetAlert)
app.use(Vue3Toastify, {
  autoClose: 3000
})

app.use(VueGtag, {
  config: {
    id: "G-DMP345Q20V"
  }
}, router);

app.use(VCalendar, {})

app.use(VueShepherdPlugin)
app.use(VResizable)

app.use(CoreuiVue);
import CIcon from '@coreui/icons-vue'

import { iconsSet as icons } from '@/assets/icons'

app.use(i18n)

app.provide('icons', icons)
app.component('PopperWidget', Popper)
app.component('fa-icon', FontAwesomeIcon)
app.component('CIcon', CIcon)

app.config.globalProperties.$dayjs = dayjs

app.mount('#app')
