import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

import { useAuthStore } from '@/stores/auth'
import { getAccount } from '@/repositories/AuthRepository.js'

// Helper function to check if user has required permissions
function hasPermission(userPermissions, requiredPermissions) {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true; // No specific permissions required
  }

  if (!userPermissions || userPermissions.length === 0) {
    return false; // User has no permissions
  }

  // Check if user has at least one of the required permissions
  return requiredPermissions.some(permission =>
    userPermissions.includes(permission)
  );
}

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
      path: '/password-enforced',
      name: 'password-enforced',
      component: () => import('../views/PasswordEnforcedView.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      children: [
        {
          path: '',
          name: 'dashboard-page',
          component: () => import('../views/DashboardHome.vue'),
          meta: {
            requiresAuth: true,
            permissions: ['DASHBOARD_VIEW']
          }
        },
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
          path: 'account',
          name: 'account',
          component: () => import('../views/AccountView.vue')
        },
        {
          path: 'business-settings',
          name: 'business-settings',
          component: () => import('../views/BusinessSettingsView.vue'),
          meta: {
            requiresAuth: true,
            permissions: ['BUSINESS_SETTINGS_VIEW']
          }
        },
        {
          path: 'calendar',
          name: 'calendar',
          component: () => import('../views/CalendarView.vue'),
        },
        {
          path: 'experts',
          name: 'experts',
          component: () => import('../views/ExpertsView.vue'),
          meta: {
            requiresAuth: true,
            permissions: ['MANAGE_USERS']
          }
        },
        {
          path: 'expert/:id',
          name: 'expert',
          component: () => import('../views/ExpertView.vue'),
          meta: {
            requiresAuth: true,
            permissions: ['MANAGE_USERS']
          }
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('../views/UsersView.vue'),
          meta: {
            requiresAuth: true,
            permissions: ['MANAGE_USERS']
          }
        },
        {
          path: 'user/:id',
          name: 'user',
          component: () => import('../views/UserView.vue'),
          meta: {
            requiresAuth: true,
            permissions: ['MANAGE_USERS']
          }
        },
        {
          path: 'branches',
          name: 'branches',
          component: () => import('../views/BranchesView.vue'),
          meta: {
            requiresAuth: true,
            permissions: ['VIEW_BRANCH_DATA', 'MANAGE_BRANCH_DATA']
          }
        },
        {
          path: 'customers',
          name: 'customers',
          component: () => import('../views/CustomersView.vue'),
          meta: {
            requiresAuth: true,
            permissions: ['VIEW_CUSTOMERS']
          }
        },
        {
          path: 'procedures',
          name: 'procedures',
          component: () => import('../views/ProceduresView.vue'),
          meta: {
            requiresAuth: true,
            permissions: ['VIEW_SERVICES', 'MANAGE_SERVICES']
          }
        },
        {
          path: 'procedure/:id',
          name: 'procedure',
          component: () => import('../views/ProcedureView.vue'),
          meta: {
            requiresAuth: true,
            permissions: ['VIEW_SERVICES', 'MANAGE_SERVICES']
          }
        },
        {
          path: 'blacklist',
          name: 'blacklist',
          component: () => import('../views/BlacklistView.vue'),
          meta: {
            requiresAuth: true,
            permissions: ['VIEW_BLACKLIST']
          }
        },
        {
          path: 'subscription',
          name: 'subscription',
          component: () => import('../views/SubscriptionView.vue'),
          meta: {
            requiresAuth: true,
            permissions: ['MANAGE_SUBSCRIPTION']
          }
        },
        {
          path: 'feedbacks',
          name: 'feedbacks',
          component: () => import('../views/FeedbacksView.vue'),
          meta: {
            requiresAuth: false,
            permissions: []
          }
        }
      ]
    },
    {
      path: '/404',
      name: '404',
      component: () => import('../views/custom_error_pages/NotFoundView.vue')
    },
    {
      path: '/401',
      name: '401',
      component: () => import('../views/custom_error_pages/UnauthorizedView.vue')
    },
    {
      path: '/403',
      name: '403',
      component: () => import('../views/custom_error_pages/NotAllowedView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404'
    }
  ]
})

router.beforeResolve((to, from, next) => {
  let token = localStorage.getItem('token')


  if (token) {
    const auth = useAuthStore();
    auth.setLoading(true);
    //decoding token
    getAccount(token).then(({ code, data }) => {
      if (code === 200) {
        auth.setLoading(false);
        auth.setUser(data)
        auth.setToken(token)
        auth.setPermissions(data.permissions || [])
        auth.setCompany(data.company)
        auth.setCompanyPackage(data.package)

        // Check for password change requirement
        if(data.password_change_required && to.name !== 'password-enforced') {
          next({ name: 'password-enforced', query: { back: to.path } })
          return
        }

        // Check permissions for the route
        if (to.meta && to.meta.requiresAuth) {
          const userPermissions = data.permissions || []
          const requiredPermissions = to.meta.permissions || []

          if (!hasPermission(userPermissions, requiredPermissions)) {
            // User doesn't have required permissions
            console.warn(`Access denied to ${to.path}. Required permissions:`, requiredPermissions, 'User permissions:', userPermissions)
            next({ name: '403', query: { back: to.path } })
            return
          }
        }

        next()
      } else {
        localStorage.removeItem('token')
        // Reload page
        window.location.reload()
      }
    }).catch(error => {
      console.error('Error getting account:', error)
      localStorage.removeItem('token')
      next({ name: 'login', query: { back: to.path } })
    })
  } else {
    if (['login', 'register', 'splash'].indexOf(to.name) === -1) {
      next({ name: 'login', query: { back: to.path } })
    } else {
      next()
    }
  }
})

export default router
