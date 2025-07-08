<script>
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { useAuthStore } from '@/stores/auth.js'
import { mapState } from 'pinia'

export default {
  name: 'DashboardView',
  components: { AppHeader, AppSidebar, AppFooter},
  data() {
    return {}
  },
  watch: {
    '$route'() {
      // Reset the ready state when the route changes
      this.ready = false
    }
  },
  computed: {

    ...mapState(useAuthStore, ['token', 'companyPackage']),

    fluid() {
      return this.$route.name === 'calendar'
    },

    ready() {
      // Check if the companyPackage is loaded and the route is not 'subscription'
      return this.companyPackage || this.$route.name === 'subscription'
    }
  },
  methods: {},
  mounted() {
    if(!this.companyPackage && this.$route.name !== 'subscription') {
      this.$router.push({ name: 'subscription' })
    }
  }
}
</script>

<template>


  <div class="flex">
    <AppSidebar />
    <div class="flex flex-col min-h-screen flex-1">
      <AppHeader />
      <div class="flex-1">
        <div v-if="ready">
          <router-view />
        </div>
      </div>
      <AppFooter />
    </div>
  </div>

</template>
