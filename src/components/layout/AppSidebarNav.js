import { defineComponent, h, onMounted, ref, resolveComponent } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { CBadge, CSidebarNav, CNavItem, CNavGroup, CNavTitle } from '@coreui/vue'


import simplebar from 'simplebar-vue'
import 'simplebar-vue/dist/simplebar.min.css'

const normalizePath = (path) =>
  decodeURI(path)
    .replace(/#.*$/, '')
    .replace(/(index)?\.(html)$/, '')

const isActiveLink = (route, link) => {
  if (link === undefined) {
    return false
  }

  if (route.hash === link) {
    return true
  }

  const currentPath = normalizePath(route.path)
  const targetPath = normalizePath(link)

  return currentPath === targetPath
}

const isActiveItem = (route, item) => {
  if (isActiveLink(route, item.to)) {
    return true
  }

  if (item.items) {
    return item.items.some((child) => isActiveItem(route, child))
  }

  return false
}

const AppSidebarNav = defineComponent({
  name: 'AppSidebarNav',
  components: {
    CNavItem,
    CNavGroup,
    CNavTitle,
  },
  setup() {
    const route = useRoute()
    const firstRender = ref(true)

    onMounted(() => {
      firstRender.value = false
    })

    const renderItem = (item) => {
      if (item.items) {
        return h(
          CNavGroup,
          {
            as: 'div',
            compact: true,
            ...(firstRender.value && {
              visible: item.items.some((child) => isActiveItem(route, child)),
            }),
          },
          {
            togglerContent: () => [
              h(resolveComponent('CIcon'), {
                customClassName: 'nav-icon',
                name: item.icon,
              }),
              item.name,
            ],
            default: () => item.items.map((child) => renderItem(child)),
          },
        )
      }

      if (item.href) {
        return h(
          resolveComponent(item.component),
          {
            href: item.href,
            target: '_blank',
            rel: 'noopener noreferrer',
          },
          {
            default: () => [
              item.icon
                ? h(resolveComponent('CIcon'), {
                  customClassName: 'nav-icon',
                  name: item.icon,
                })
                : h('span', { class: 'nav-icon' }, h('span', { class: 'nav-icon-bullet' })),
              item.name,
              item.external && h(resolveComponent('CIcon'), {
                class: 'ms-2',
                name: 'cil-external-link',
                size: 'sm'
              }),
              item.badge &&
              h(
                CBadge,
                {
                  class: 'ms-auto',
                  color: item.badge.color,
                  size: 'sm',
                },
                {
                  default: () => item.badge.text,
                },
              ),
            ],
          },
        )
      }

      return item.to
        ? h(
          RouterLink,
          {
            to: item.to,
            custom: true,
          },
          {
            default: (props) => {
              // Special handling for dashboard - only active when exactly on /dashboard
              let isActive = props.isActive
              if (item.to === '/dashboard' && route.path !== '/dashboard') {
                isActive = false
              }

              return h(
                resolveComponent(item.component),
                {
                  active: isActive,
                  as: 'div',
                  href: props.href,
                  onClick: () => props.navigate(),
                },
                {
                  default: () => [
                    item.icon
                      ? h(resolveComponent('CIcon'), {
                        customClassName: 'nav-icon',
                        name: item.icon,
                      })
                      : h('span', { class: 'nav-icon' }, h('span', { class: 'nav-icon-bullet' })),
                    item.name,
                    item.badge &&
                    h(
                      CBadge,
                      {
                        class: 'ms-auto',
                        color: item.badge.color,
                        size: 'sm',
                      },
                      {
                        default: () => item.badge.text,
                      },
                    ),
                  ],
                },
              )
            },
          },
        )
        : h(
          resolveComponent(item.component),
          {
            as: 'div',
          },
          {
            default: () => item.name,
          },
        )
    }

    let nav = [
      {
        component: 'CNavItem',
        name: 'Dashboard',
        to: '/dashboard',
        icon: 'cil-speedometer',
      },
      {
        component: 'CNavItem',
        name: 'Calendar',
        to: '/dashboard/calendar',
        icon: 'cil-calendar',
      },
      {
        component: 'CNavItem',
        name: 'Branches',
        to: '/dashboard/branches',
        icon: 'cil-factory',
      },
      // {
      //   component: 'CNavItem',
      //   name: 'Experts',
      //   to: '/dashboard/experts',
      //   icon: 'cil-briefcase',
      // },
      {
        component: 'CNavItem',
        name: 'Users',
        to: '/dashboard/users',
        icon: 'cil-user',
      },
      {
        component: 'CNavItem',
        name: 'Procedures',
        to: '/dashboard/procedures',
        icon: 'cil-list-rich',
      },
      {
        component: 'CNavItem',
        name: 'Customer List',
        to: '/dashboard/customers',
        icon: 'cil-user',
      },
      {
        component: 'CNavItem',
        name: 'Blacklist',
        to: '/dashboard/blacklist',
        icon: 'cil-ban',
      },
      {
        component: 'CNavItem',
        name: 'Subscription',
        to: '/dashboard/subscription',
        icon: 'cil-dollar',
      },
      {
        component: 'CNavItem',
        name: 'Permissions',
        to: '/dashboard/permissions',
        icon: 'cil-lock-locked',
      },
      {
        component: 'CNavItem',
        name: 'Feedback',
        to: '/dashboard/feedbacks',
        icon: 'cil-comment-square',
      },
    ];
    return () =>
      h(
        CSidebarNav,
        {
          as: simplebar,
        },
        {
          default: () => nav.map((item) => renderItem(item)),
        },
      )
  },
})

export { AppSidebarNav }
