import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

import { createApp } from 'vue'
import { createPinia } from 'pinia'


import dayjs from "dayjs";
import  plugin  from 'dayjs/plugin/customParseFormat'
dayjs.extend(plugin)

import VueSweetAlert from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

import Vue3Toastify from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';


import Popper from "vue3-popper";

import App from './App.vue'
import router from './router'
import {createI18n} from "vue-i18n";


import localeEn from './locale/en.json'

const i18n = createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    legacy: false,
    messages: {
        en: localeEn
    }
})



const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueSweetAlert)
app.use(Vue3Toastify, {
    autoClose: 3000,
});

app.use(i18n)
app.component("PopperWidget", Popper);

app.config.globalProperties.$dayjs = dayjs;

app.mount('#app')
