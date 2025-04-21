<script setup>
import { onMounted, ref, watch } from 'vue'
import { useColorModes } from '@coreui/vue'

import AppHeaderDropdownAccnt from '@/components/layout/AppHeaderDropdownAccnt.vue'
import { useSidebarStore } from '@/stores/sidebar.js'
import {useThemeStore} from '@/stores/theme.js'

const headerClassNames = ref('mb-0 p-0')
const { colorMode, setColorMode } = useColorModes('coreui-free-vue-admin-template-theme')
const sidebar = useSidebarStore()

const themeStore = useThemeStore();

onMounted(() => {
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
})

watch(colorMode, (newValue) => {
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
      <div class="position-relative">
      <form class="d-none d-sm-flex">
        <div class="input-group">
          <span class="input-group-text bg-body-secondary border-0 ps-3" id="search-addon">
            <CIcon icon="cil-magnifying-glass" size="lg" />
          </span>
          <input placeholder="Search..." aria-label="Search"
                 ariadescribedby="search-addon"
                 class="form-control bg-body-secondary border-0"
                 type="search">
        </div>
      </form>
<!--        <div class="searchResult">
          <div v-if="searchResult.length >0">
            <div class="searchResultItem small"
                 @click.prevent="resultClicked(r)"
                 v-for="r in searchResult" :key="r.id">

              <strong>{{ r.name }} {{ r.surname }}</strong> <br>
              <small>{{ r.email }}</small> <br>
              <small>{{ r.phone }}</small> <br>
              <small><em>{{ $dayjs(r.reservationStartTime.date).format('DD.MM.YYYY HH:mm') }}</em></small>
            </div>
          </div>
          <div class="alert alert-info p-1 small" v-else-if="noResult">
            No result found
          </div>
        </div>-->
      </div>
      <!--
       <CHeaderNav class="d-none d-md-flex">
        <CNavItem>
          <router-link class="nav-link" :to="{name:'dashboard'}">
            Calendar
          </router-link>
        </CNavItem>
        <CNavItem>
          <router-link class="nav-link" :to="{name:'experts'}" v-if="user.role!=='expert'">
            Experts
          </router-link>
        </CNavItem>
        <CNavItem>
          <router-link class="nav-link" :to="{name:'procedures'}" v-if="user.role==='manager'">
            Procedures
          </router-link>
        </CNavItem>
      </CHeaderNav>
        <CHeaderNav class="ms-auto">
              <CNavItem>
                <CNavLink href="#">
                  <CIcon icon="cil-bell" size="lg" />
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#">
                  <CIcon icon="cil-list" size="lg" />
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#">
                  <CIcon icon="cil-envelope-open" size="lg" />
                </CNavLink>
              </CNavItem>
            </CHeaderNav>-->
      <CHeaderNav>
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
