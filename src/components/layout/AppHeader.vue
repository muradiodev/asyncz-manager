<script setup>
import { ref, nextTick } from 'vue'
import { useSidebarStore } from '@/stores/sidebar.js'
import AppHeaderDropdownAccnt from '@/components/layout/AppHeaderDropdownAccnt.vue'
import AiSchedulerView from '@/views/AiSchedulerView.vue'

const sidebar = useSidebarStore()
const isSearchExpanded = ref(false)
const searchInput = ref(null)
const searchQuery = ref('')

const expandSearch = () => {
  isSearchExpanded.value = true
  nextTick(() => searchInput.value && searchInput.value.focus())
}

const collapseSearch = () => {
  isSearchExpanded.value = false
  searchQuery.value = ''
}
</script>

<template>
  <header class="bg-white shadow sticky top-0 z-50">
    <div class="flex items-center border-b px-4 py-2">
      <button class="p-2" @click="sidebar.toggleVisible()">
        <fa-icon icon="bars" />
      </button>
      <div class="flex flex-1 justify-center">
        <div class="ai-scheduler-wrapper">
          <AiSchedulerView />
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <div class="relative" v-if="!isSearchExpanded">
          <button type="button" class="p-2" @click.stop="expandSearch">
            <fa-icon icon="search" />
          </button>
        </div>
        <div v-else class="flex items-center space-x-2">
          <input
            ref="searchInput"
            v-model="searchQuery"
            placeholder="Search..."
            class="border rounded px-2 h-8"
            type="search"
          >
          <button type="button" class="px-2" @click.stop="collapseSearch">×</button>
        </div>
        <AppHeaderDropdownAccnt />
      </div>
    </div>
  </header>
</template>

<style scoped>
.ai-scheduler-wrapper {
  max-width: 500px;
  width: 100%;
}
</style>
