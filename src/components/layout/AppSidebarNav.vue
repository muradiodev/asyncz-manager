<template>
  <CSidebarNav :as="simplebar">
    <template v-for="item in nav" :key="item.name">
      <CNavGroup :compact="true" :visible="!firstRender" v-if="item.items">
        <CNavTitle>{{ item.name }}</CNavTitle>
        <CNavItem
          :key="item.name"
          :to="item.to"
          :name="item.name"
          :icon="item.icon"
          :active="isActiveItem(item)"
        />
      </CNavGroup>
      <template v-else>
        <div class="nav-item" :id="item.ref" :active="isActiveLink(item.to)">
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
import { CNavItem, CNavGroup, CNavTitle } from '@coreui/vue'
import simplebar from 'simplebar-vue'
import 'simplebar-vue/dist/simplebar.min.css'
import { computed, markRaw } from 'vue'   // ← add markRaw
import { useI18n } from 'vue-i18n'

export default {
  name: 'AppSidebarNav',
  components: { CNavItem, CNavGroup, CNavTitle },
  data() {
    return {
      simplebar: markRaw(simplebar),   // ← make it non-reactive
      firstRender: true
    }
  },
  setup() {
    const { t } = useI18n()
    const nav = computed(() => [
      {
        name: t('appSidebarNav.dashboard'),
        ref: 'menu_dashboard',
        to: { name: 'dashboard-page' },
        icon: 'cil-speedometer'
      },
      {
        name: t('appSidebarNav.calendar'),
        ref: 'menu_calendar',
        to: { name: 'calendar' },
        icon: 'cil-calendar'
      },
      {
        name: t('appSidebarNav.branches'),
        ref: 'menu_branches',
        to: { name: 'branches' },
        icon: 'cil-factory'
      },
      {
        name: t('appSidebarNav.users'),
        ref: 'menu_users',
        to: { name: 'users' },
        icon: 'cil-user'
      },
      {
        name: t('appSidebarNav.services'),
        ref: 'menu_services',
        to: { name: 'procedures' },
        icon: 'cil-list-rich'
      },
      {
        name: t('appSidebarNav.customerList'),
        ref: 'menu_customers',
        to: { name: 'customers' },
        icon: 'cil-user'
      },
      {
        name: t('appSidebarNav.blacklist'),
        ref: 'menu_blacklist',
        to: { name: 'blacklist' },
        icon: 'cil-ban'
      },
      {
        name: t('appSidebarNav.subscription'),
        ref: 'menu_subscription',
        to: { name: 'subscription' },
        icon: 'cil-dollar'
      },
      {
        name: t('appSidebarNav.feedback'),
        ref: 'menu_feedback',
        to: { name: 'feedbacks' },
        icon: 'cil-comment-square'
      }
    ])
    return { nav }
  },
  methods: {
    normalizePath(path) {
      return decodeURI(path).replace(/#.*$/, '').replace(/(index)?\.(html)$/, '')
    },
    isActiveLink(link) {
      if (link === undefined) return false
      if (this.$route.hash === link) return true
      const currentPath = this.normalizePath(this.$route.path)
      const targetPath = this.normalizePath(link)
      return currentPath === targetPath
    },
    isActiveItem(item) {
      if (this.isActiveLink(item.to)) return true
      return item.items ? item.items.some((child) => this.isActiveItem(child)) : false
    }
  },
  mounted() {
    this.firstRender = false
  }
}
</script>

<style scoped>
/* Add any additional styles here */
</style>
