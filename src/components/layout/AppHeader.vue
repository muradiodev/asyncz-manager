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
        </div>

        <!-- Language Selector -->
        <div class="dropdown">
          <button class="btn btn-outline-secondary dropdown-toggle" type="button" id="languageDropdown" data-bs-toggle="dropdown" aria-expanded="false">
            {{ currentLanguage }}
          </button>
          <ul class="dropdown-menu" aria-labelledby="languageDropdown">
            <li><button class="dropdown-item" @click="changeLanguage('en')">English</button></li>
            <li><button class="dropdown-item" @click="changeLanguage('de')">Deutsch</button></li>
            <li><button class="dropdown-item" @click="changeLanguage('az')">Azərbaycanca</button></li>
            <li><button class="dropdown-item" @click="changeLanguage('tr')">Türkçe</button></li>
          </ul>
        </div>

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

<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { CHeader, useColorModes } from '@coreui/vue'
import AppHeaderDropdownAccnt from '@/components/layout/AppHeaderDropdownAccnt.vue'
import { useSidebarStore } from '@/stores/sidebar.js'
import AiSchedulerView from '@/views/AiSchedulerView.vue'
import { useThemeStore } from '@/stores/theme.js'
import { useAuthStore } from '@/stores/auth.js'
import { useI18n } from 'vue-i18n'

const headerClassNames = ref('mb-0 p-0')
const { colorMode, setColorMode } = useColorModes('coreui-free-vue-admin-template-theme')

const sidebar = useSidebarStore()
const themeStore = useThemeStore()
const { t, locale } = useI18n()

// Language handling
const currentLanguage = ref(locale.value)

const changeLanguage = (lang) => {
  locale.value = lang
  localStorage.setItem('preferredLanguage', lang)
  currentLanguage.value = lang
}

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

  // Load preferred language from local storage
  const savedLanguage = localStorage.getItem('preferredLanguage')
  if (savedLanguage) {
    locale.value = savedLanguage
    currentLanguage.value = savedLanguage
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', checkScreenSize)
})

watch(colorMode, (newValue) => {
  if (newValue === 'auto') {
    newValue = 'light';
  }
  localStorage.setItem('colorMode', newValue)
  themeStore.toggleTheme(newValue)
})
</script>

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
