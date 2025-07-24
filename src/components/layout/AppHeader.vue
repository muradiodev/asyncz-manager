<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { CHeader, useColorModes } from '@coreui/vue'

import AppHeaderDropdownAccnt from '@/components/layout/AppHeaderDropdownAccnt.vue'
import { useSidebarStore } from '@/stores/sidebar.js'
import AiSchedulerView from '@/views/AiSchedulerView.vue'
import { useThemeStore } from '@/stores/theme.js'
import { useAuthStore } from '@/stores/auth.js'

const headerClassNames = ref('mb-0 p-0')
const { colorMode, setColorMode } = useColorModes('coreui-free-vue-admin-template-theme')

const sidebar = useSidebarStore()
const themeStore = useThemeStore()

// Search functionality
const isSearchExpanded = ref(false)
const searchInput = ref(null)
const searchQuery = ref('')
const isMobile = ref(false)

// Check screen size
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768
  // Auto-collapse search on mobile
  if (isMobile.value && isSearchExpanded.value) {
    collapseSearch()
  }
}

const expandSearch = () => {
  console.log('expandSearch called')
  isSearchExpanded.value = true
  nextTick(() => {
    if (searchInput.value) {
      searchInput.value.focus()
    }
  })
}

const ownShareLink = () => {
  const auth = useAuthStore()
  return `http://book.asyncz.com/?share=${auth.user['shareHash']}`
}

const collapseSearch = () => {
  console.log('collapseSearch called')
  isSearchExpanded.value = false
  searchQuery.value = ''
}

const handleClickOutside = (event) => {
  const copyBtn = event.target.closest('.copy-link-btn')
  if (copyBtn) {
    const link = ownShareLink()
    navigator.clipboard
      .writeText(link)
      .then(() => {
        // this.$swal({ title: 'Copied!', text: 'Link copied to clipboard.', icon: 'success' })
      })
      .catch(() => {
        alert("Failed to copy the link.")
        // this.$swal({ title: 'Oops!', text: 'Failed to copy the link.', icon: 'error' })
      })
  }
  const searchContainer = event.target.closest('.search-container')
  if (!searchContainer && isSearchExpanded.value) {
    collapseSearch()
  }
}

onMounted(() => {

  // Force initial state
  isSearchExpanded.value = false
  checkScreenSize()

  let theme = localStorage.getItem('colorMode')
  if (theme) {
    setColorMode(theme)
    themeStore.toggleTheme(theme)
  } else {
    setColorMode('light')
    themeStore.toggleTheme('light')
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
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', checkScreenSize)
})

watch(colorMode, (newValue) => {
  if (newValue === 'auto') {
    // const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    // newValue = prefersDark ? 'light' : 'light';
    newValue = 'light';
  }
  localStorage.setItem('colorMode', newValue)
  themeStore.toggleTheme(newValue)
})
</script>

<template>
  <CHeader position="sticky" :class="headerClassNames">
    <CContainer class="border-bottom px-2 px-md-4" fluid>
      <CHeaderToggler @click="sidebar.toggleVisible()" style="margin-inline-start: -14px">
        <CIcon icon="cil-menu" size="lg" />
      </CHeaderToggler>

      <!-- Keep AI Scheduler exactly as it was -->
      <div class="d-flex flex-grow-1 justify-content-center">
        <div class="ai-scheduler-wrapper">
          <AiSchedulerView />
        </div>
      </div>

      <CHeaderNav class="responsive-nav">
        <!-- Search functionality - now responsive -->
        <div class="position-relative search-container d-none d-lg-flex">
          <!-- Share Link-->
          <button
            type="button"
            class="btn btn-outline-success border-0 copy-link-btn"
            data-bs-toggle="tooltip"
            data-bs-placement="bottom"
            title="Copy public link of company"
            style="transition: all 0.3s ease;"
            @mouseenter="$event.target.querySelector('i').style.color = 'white'"
            @mouseleave="$event.target.querySelector('i').style.color = ''"
          >
            <i class="fas fa-link"></i>
          </button>


          <!-- Collapsed search - just icon -->
          <button
            v-if="!isSearchExpanded"
            type="button"
            class="btn btn-outline-success border-0"
            @click.stop="expandSearch"
            data-bs-toggle="tooltip"
            data-bs-placement="bottom"
            title="Search"
            style="transition: all 0.3s ease;"
            @mouseenter="$event.target.querySelector('i').style.color = 'white'"
            @mouseleave="$event.target.querySelector('i').style.color = ''"
          >
            <i class="fas fa-search"></i>
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
                :style="{ minWidth: isMobile ? '200px' : '250px' }"
              />
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

        <!-- Mobile/Tablet compact buttons -->
        <div class="d-flex d-lg-none mobile-actions">
          <!-- Mobile Share Link -->
          <button type="button" class="btn btn-outline-success border-0 copy-link-btn mobile-btn">
            <i class="fas fa-link"></i>
          </button>

          <!-- Mobile Search -->
          <button
            type="button"
            class="btn btn-outline-success border-0 mobile-btn"
            @click.stop="expandSearch"
          >
            <CIcon icon="cil-magnifying-glass" />
          </button>
        </div>

        <!-- Theme Dropdown - responsive -->
<!--        <CDropdown variant="nav-item" placement="bottom-end">-->
<!--          <CDropdownToggle :caret="false">-->
<!--            <CIcon v-if="colorMode === 'dark'" icon="cil-moon" :size="isMobile ? 'md' : 'lg'" />-->
<!--            <CIcon v-else-if="colorMode === 'light'" icon="cil-sun" :size="isMobile ? 'md' : 'lg'" />-->
<!--            <CIcon v-else icon="cil-contrast" :size="isMobile ? 'md' : 'lg'" />-->
<!--          </CDropdownToggle>-->
<!--          <CDropdownMenu>-->
<!--            <CDropdownItem-->
<!--              :active="colorMode === 'light'"-->
<!--              class="d-flex align-items-center"-->
<!--              component="button"-->
<!--              type="button"-->
<!--              @click="setColorMode('light')"-->
<!--            >-->
<!--              <CIcon class="me-2" icon="cil-sun" :size="isMobile ? 'md' : 'lg'" />-->
<!--              Light-->
<!--            </CDropdownItem>-->
<!--            <CDropdownItem-->
<!--              :active="colorMode === 'dark'"-->
<!--              class="d-flex align-items-center"-->
<!--              component="button"-->
<!--              type="button"-->
<!--              @click="setColorMode('dark')"-->
<!--            >-->
<!--              <CIcon class="me-2" icon="cil-moon" :size="isMobile ? 'md' : 'lg'" />-->
<!--              Dark-->
<!--            </CDropdownItem>-->
<!--            <CDropdownItem-->
<!--              :active="colorMode === 'auto'"-->
<!--              class="d-flex align-items-center"-->
<!--              component="button"-->
<!--              type="button"-->
<!--              @click="setColorMode('auto')"-->
<!--            >-->
<!--              <CIcon class="me-2" icon="cil-contrast" :size="isMobile ? 'md' : 'lg'" />-->
<!--              Auto-->
<!--            </CDropdownItem>-->
<!--          </CDropdownMenu>-->
<!--        </CDropdown>-->

        <li class="nav-item py-1 d-none d-lg-block">
          <div class="vr h-100 mx-2 text-body text-opacity-75"></div>
        </li>

        <AppHeaderDropdownAccnt />
      </CHeaderNav>

      <!-- Mobile Search Overlay -->
      <div
        v-if="isSearchExpanded && isMobile"
        class="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 mobile-search-overlay"
        @click="collapseSearch"
      >
        <div class="position-absolute top-0 start-0 w-100 bg-body p-3" @click.stop>
          <div class="input-group">
            <span class="input-group-text bg-body-secondary border-0 ps-3">
              <CIcon icon="cil-magnifying-glass" />
            </span>
            <input
              ref="searchInput"
              v-model="searchQuery"
              placeholder="Search..."
              class="form-control bg-body-secondary border-0"
              type="search"
            />
            <button
              type="button"
              class="btn btn-outline-secondary border-0 px-3"
              @click="collapseSearch"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </CContainer>
  </CHeader>
</template>

<style scoped>
/* Mobile responsive adjustments */
@media (max-width: 991.98px) {
  .mobile-actions {
    gap: 0.25rem;
  }

  .mobile-btn {
    padding: 0.375rem 0.5rem;
    min-width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .responsive-nav {
    flex-wrap: nowrap;
    gap: 0.25rem;
  }
}

/* Tablet adjustments */
@media (min-width: 768px) and (max-width: 991.98px) {
  .mobile-btn {
    min-width: 44px;
    height: 44px;
  }
}

/* Mobile search overlay */
.mobile-search-overlay {
  z-index: 1050;
}

/* Ensure AI Scheduler stays centered and untouched */
.ai-scheduler-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Responsive container padding */
@media (max-width: 575.98px) {
  .CContainer {
    padding-left: 1rem !important;
    padding-right: 1rem !important;
  }
}
</style>
