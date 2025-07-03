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
            path: '/register',
            name: 'register',
            component: () => import('../views/RegisterView.vue')
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
                    path: 'profile',
                    name: 'profile',
                    component: () => import('../views/ProfileView.vue')
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
                    path: 'users',
                    name: 'users',
                    component: () => import('../views/UsersView.vue')
                },

                {
                    path: 'user/:id',
                    name: 'user',
                    component: () => import('../views/UserView.vue')
                },
                {
                    path: 'branches',
                    name: 'branches',
                    component: () => import('../views/BranchesView.vue')
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
                },

                {
                    path: 'blacklist',
                    name: 'blacklist',
                    component: () => import('../views/BlacklistView.vue')
                },


                {
                    path: 'subscription',
                    name: 'subscription',
                    component: () => import('../views/SubscriptionView.vue')
                },


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
                auth.setCompany(data.company)
                auth.setCompanyPackage(data.package)
                console.log(data.package)
                next();
            } else {
                localStorage.removeItem('token');
                //reload page
                window.location.reload();
            }
        });
    } else {
        if (['login', 'register', 'splash'].indexOf(to.name) === -1) {
            next({name: 'login', query: {back: to.path}})
        } else {
            next()
        }
    }
})

export default router
