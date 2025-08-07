<template>

  <RouterView />
  <div v-if="isLoading" class="loading-overlay-center" style="z-index: 9999; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(255, 255, 255, 0.8); display: flex; align-items: center; justify-content: center;">
    <div class="d-flex flex-column align-items-center justify-content-center">
      <div class="spinner-border text-secondary mb-3" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-muted">Loading data...</p>
    </div>
  </div>
</template>

<script>


import { useAuthStore } from '@/stores/auth.js'
import { mapState } from 'pinia'

export default {
  name: 'App',
  components: {},
  data() {
    return {}
  },
  watch: {},
  computed: {
    ...mapState(useAuthStore, ['token', 'isLoading']),
  },
  methods: {},
  mounted() {
  }
}

</script>
<style lang="scss">

// Import Main styles for this application
@use 'assets/styles/style';
// We use those styles to show code examples, you should remove them in your application.
@use 'assets/styles/examples';
</style>
