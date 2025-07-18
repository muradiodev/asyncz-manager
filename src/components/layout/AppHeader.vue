<script setup>
import { onMounted, ref, watch, nextTick, onUnmounted } from 'vue'
import { CHeader, useColorModes } from '@coreui/vue'

import AppHeaderDropdownAccnt from '@/components/layout/AppHeaderDropdownAccnt.vue'
import { useSidebarStore } from '@/stores/sidebar.js'
import AiSchedulerView from '@/views/AiSchedulerView.vue' // Add this import

import {useThemeStore} from '@/stores/theme.js'
const headerClassNames = ref('mb-0 p-0')
const { colorMode, setColorMode } = useColorModes('coreui-free-vue-admin-template-theme')

const sidebar = useSidebarStore()
const themeStore = useThemeStore();


// Search functionality - explicitly set to false
const isSearchExpanded = ref(false)
const searchInput = ref(null)
const searchQuery = ref('')

const expandSearch = () => {
  console.log('expandSearch called')
  isSearchExpanded.value = true
  nextTick(() => {
    if (searchInput.value) {
      searchInput.value.focus()
    }
  })
}

const collapseSearch = () => {
  console.log('collapseSearch called')
  isSearchExpanded.value = false
  searchQuery.value = ''
}

const handleClickOutside = (event) => {
  const searchContainer = event.target.closest('.search-container')
  if (!searchContainer && isSearchExpanded.value) {
    collapseSearch()
  }
}

onMounted(() => {
  // Force initial state
  isSearchExpanded.value = false

  let theme = localStorage.getItem('colorMode')
  if (theme) {
    setColorMode(theme)
    themeStore.toggleTheme(theme);
  } else {
    setColorMode('auto')
    themeStore.toggleTheme('auto');
  }

  let sidebarUnfoldable = localStorage.getItem('sidebar-unfoldable')
  if (sidebarUnfoldable) {
    sidebar.unfoldable = sidebarUnfoldable === 'true'
  } else {
    sidebar.unfoldable = true
  }

  document.addEventListener('scroll', () => {
    if (document.documentElement.scrollTop > 0) {
      headerClassNames.value = 'mb-0 p-0 shadow-sm'
    } else {
      headerClassNames.value = 'mb-0 p-0'
    }
  })

  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(colorMode, (newValue) => {
  if (newValue === 'auto') {
    // Automatically set to dark or light based on system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    newValue = prefersDark ? 'dark' : 'light';
  }
  localStorage.setItem('colorMode', newValue)
  themeStore.toggleTheme(newValue);
})

</script>

<template>
  <CHeader position="sticky" :class="headerClassNames">
    <CContainer class="border-bottom px-4" fluid>
      <CHeaderToggler @click="sidebar.toggleVisible()" style="margin-inline-start: -14px">
        <CIcon icon="cil-menu" size="lg" />
      </CHeaderToggler>

      <div class="d-flex flex-grow-1 justify-content-center">
        <div class="ai-scheduler-wrapper">
          <AiSchedulerView />
        </div>
      </div>

      <CHeaderNav>
        <!-- Search functionality moved here -->
        <div class="position-relative search-container d-none d-sm-flex">
          <!-- Collapsed search - just icon -->
          <button
            v-if="!isSearchExpanded"
            type="button"
            class="btn btn-outline-success border-0"
            @click.stop="expandSearch"
            style=""
          >
            <CIcon icon="cil-magnifying-glass" size="lg" />
          </button>


          <!-- Expanded search form -->
          <div v-if="isSearchExpanded" class="d-flex">
            <div class="input-group">
              <span class="input-group-text bg-body-secondary border-0 ps-3" id="search-addon">
                <CIcon icon="cil-magnifying-glass" size="lg" />
              </span>
              <input
                ref="searchInput"
                v-model="searchQuery"
                placeholder="Search..."
                aria-label="Search"
                aria-describedby="search-addon"
                class="form-control bg-body-secondary border-0"
                type="search"
                style="min-width: 250px;"
              >
              <button
                type="button"
                class="btn btn-outline-secondary border-0 px-3"
                @click.stop="collapseSearch"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <CDropdown variant="nav-item" placement="bottom-end">
          <CDropdownToggle :caret="false">
            <CIcon v-if="colorMode === 'dark'" icon="cil-moon" size="lg" />
            <CIcon v-else-if="colorMode === 'light'" icon="cil-sun" size="lg" />
            <CIcon v-else icon="cil-contrast" size="lg" />
          </CDropdownToggle>
          <CDropdownMenu>
            <CDropdownItem
              :active="colorMode === 'light'"
              class="d-flex align-items-center"
              component="button"
              type="button"
              @click="setColorMode('light')"
            >
              <CIcon class="me-2" icon="cil-sun" size="lg" />
              Light
            </CDropdownItem>
            <CDropdownItem
              :active="colorMode === 'dark'"
              class="d-flex align-items-center"
              component="button"
              type="button"
              @click="setColorMode('dark')"
            >
              <CIcon class="me-2" icon="cil-moon" size="lg" />
              Dark
            </CDropdownItem>
            <CDropdownItem
              :active="colorMode === 'auto'"
              class="d-flex align-items-center"
              component="button"
              type="button"
              @click="setColorMode('auto')"
            >
              <CIcon class="me-2" icon="cil-contrast" size="lg" />
              Auto
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
        <li class="nav-item py-1">
          <div class="vr h-100 mx-2 text-body text-opacity-75"></div>
        </li>
        <AppHeaderDropdownAccnt />
      </CHeaderNav>
    </CContainer>
  </CHeader>
</template>

<style scoped>
</style>
