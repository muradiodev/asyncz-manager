import {createRouter, createWebHistory} from 'vue-router'
import HomeView from '../views/HomeView.vue'

import {useAuthStore} from '@/stores/auth'
import {getProfile} from "@/repositories/AuthRepository.js";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'splash',
            component: HomeView
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/LoginView.vue')
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: () => import('../views/DashboardView.vue'),
            children: [
                {
                    path: '',
                    component: () => import('../views/HomeView.vue'),
                    alias: 'home'
                },

                {
                    path: 'home',
                    name: 'home',
                    component: () => import('../views/HomeView.vue')
                },

                {
                    path: 'calendar',
                    name: 'calendar',
                    component: () => import('../views/CalendarView.vue')
                },
                {
                    path: 'experts',
                    name: 'experts',
                    component: () => import('../views/ExpertsView.vue')
                },

                {
                    path: 'expert/:id',
                    name: 'expert',
                    component: () => import('../views/ExpertView.vue')
                },

                {
                    path: 'procedures',
                    name: 'procedures',
                    component: () => import('../views/ProceduresView.vue')
                },

                {
                    path: 'procedure/:id',
                    name: 'procedure',
                    component: () => import('../views/ProcedureView.vue')
                }
            ]
        }
    ]
})


router.beforeResolve((to, from, next) => {
    let token = localStorage.getItem('token')

    if (token) {
        //decoding token

        getProfile(token).then(({code, data}) => {
            if (code === 200) {
                const auth = useAuthStore()
                auth.setUser(data)
                auth.setToken(token)
                next();
            }
        });
    } else {
        if (['login', 'splash'].indexOf(to.name) === -1) {
            next({name: 'login', query: {back: to.path}})
        } else {
            next()
        }
    }
})

export default router