<script>
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

export default {
  name: 'DashboardView',
  components: { AppHeader, AppSidebar, AppFooter},
  data() {
    return {}
  },
  watch: {},
  computed: {
    fluid() {
      return this.$route.name === 'calendar'
    }
  },
  methods: {},
  mounted() {
  }
}
</script>

<template>


  <div>
    <AppSidebar />
    <div class="wrapper d-flex flex-column min-vh-100">
      <AppHeader />
      <div class="body flex-grow-1">
          <router-view />
      </div>
      <AppFooter />
    </div>
  </div>

</template>
