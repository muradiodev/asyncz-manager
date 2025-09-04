<template>
  <CSidebarNav :as="simplebar">
    <template v-for="item in nav" :key="item.name">
      <CNavGroup :compact="true" :visible="!firstRender" v-if="item.items">
        <CNavTitle>Dashboard</CNavTitle>
        <CNavItem

          :key="item.name"
          :to="item.to"
          :name="item.name"
          :icon="item.icon"
          :active="isActiveItem(item)"
        />
      </CNavGroup>
      <template v-else>

        <div class="nav-item"
             :active="isActiveLink(item.to)">
          <router-link class="nav-link" :to="item.to">
            <CIcon custom-class-name="nav-icon" :name="item.icon" />
            <span class="nav-link-text">{{ item.name }}</span>
          </router-link>
        </div>
      </template>
    </template>
  </CSidebarNav>
</template>


<script>

import {   CNavItem, CNavGroup, CNavTitle} from '@coreui/vue'


import simplebar from 'simplebar-vue'
import 'simplebar-vue/dist/simplebar.min.css'

export default {
  name: 'AppSidebarNav',
  components: {
    CNavItem,
    CNavGroup,
    CNavTitle
  },
  data() {
    return {

      simplebar: simplebar,

      firstRender: true,
      nav: [
        {
          name: 'Dashboard',
          to: {
            name: 'dashboard-page'
          },
          icon: 'cil-speedometer'
        },
        {
          name: 'Calendar',
          to: {
            name: 'calendar'
          },
          icon: 'cil-calendar'
        },
        {
          name: 'Branches',
          to: {
            name: 'branches'
          },
          icon: 'cil-factory'
        },
        // {
        //   component: 'CNavItem',
        //   name: 'Experts',
        //   to: '/dashboard/experts',
        //   icon: 'cil-briefcase',
        // },
        {
          name: 'Users',
          to: {
            name: 'users'
          },
          icon: 'cil-user'
        },
        {
          name: 'Services',
          to: {
            name: 'procedures'
          },
          icon: 'cil-list-rich'
        },
        {
          name: 'Customer List',
          to: {
            name: 'customers'
          },
          icon: 'cil-user'
        },
        {
          name: 'Blacklist',
          to: {
            name: 'blacklist'
          },
          icon: 'cil-ban'
        },
        {
          name: 'Subscription',
          to: {
            name: 'subscription'
          },
          icon: 'cil-dollar'
        },
        {
          name: 'Feedback',
          to: {
            name: 'feedbacks'
          },
          icon: 'cil-comment-square'
        }
      ]
    }
  },

  methods: {

    normalizePath(path) {
      return decodeURI(path)
        .replace(/#.*$/, '')
        .replace(/(index)?\.(html)$/, '')
    },
    isActiveLink(link) {
      if (link === undefined) {
        return false
      }

      if (this.$route.hash === link) {
        return true
      }

      const currentPath = this.normalizePath(this.$route.path)
      const targetPath = this.normalizePath(link)

      return currentPath === targetPath
    },
    isActiveItem(item) {
      if (this.isActiveLink(this.$route, item.to)) {
        return true
      }

      if (item.items) {
        return item.items.some((child) => this.isActiveItem(this.$route, child))
      }

      return false
    }

  },
  mounted() {
    this.firstRender = false
  }
}
</script>
