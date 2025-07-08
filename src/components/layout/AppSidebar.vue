<script setup>
import { RouterLink } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar.js'

const sidebar = useSidebarStore()

const navItems = [
  { name: 'Dashboard', to: '/dashboard' },
  { name: 'Calendar', to: '/dashboard/calendar' },
  { name: 'Branches', to: '/dashboard/branches' },
  { name: 'Experts', to: '/dashboard/experts' },
  { name: 'Users', to: '/dashboard/users' },
  { name: 'Procedures', to: '/dashboard/procedures' },
  { name: 'Blacklist', to: '/dashboard/blacklist' },
  { name: 'Subscription', to: '/dashboard/subscription' }
]
</script>

<template>
  <aside
    class="bg-gray-800 text-gray-100 w-64 h-screen fixed inset-y-0 z-40 transform transition-transform"
    :class="{ '-translate-x-full': !sidebar.visible }"
  >
    <div class="flex items-center justify-between p-4 border-b border-gray-700">
      <RouterLink to="/">
        <img src="@/assets/images/logo.png" class="h-8" alt="logo" />
      </RouterLink>
      <button class="lg:hidden" @click="sidebar.toggleVisible()">✕</button>
    </div>
    <nav class="p-4 space-y-2">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="block px-2 py-1 rounded hover:bg-gray-700"
        @click="sidebar.toggleVisible(false)"
      >
        {{ item.name }}
      </RouterLink>
    </nav>
  </aside>
</template>
