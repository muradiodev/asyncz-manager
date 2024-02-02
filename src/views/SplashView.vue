<template>
  <div class="container mobile-size vh-100 d-flex align-items-center">
    <img src="@/assets/images/logo.png" class="img-fluid" alt="logo" />
  </div>
</template>
<script>
import { useAuthStore } from '@/stores/auth'
import { mapActions } from 'pinia'

export default {
  name: 'SplashView',
  components: {},
  data() {
    return {}
  },
  watch: {},
  methods: {
    ...mapActions(useAuthStore, ['setToken']),

    checkToken() {
      let token = localStorage.getItem('token')
      if (token) {
        //set token to store
        this.setToken(token);

        this.$router.push({ name: 'home' })
      } else {
        this.$router.push({ name: 'login' })
      }
    }
  },
  mounted() {
    setTimeout(() => {
      this.checkToken()
    }, 1000)
  }
}
</script>
