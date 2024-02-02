<script>
import NavigationView from "@/components/layout/NavigationView.vue";

export default {
  name: 'DashboardView',
  components: {NavigationView},
  data() {
    return {}
  },
  watch: {},
  computed: {},
  methods: {},
  mounted() {
  }
}
</script>

<template>

  <NavigationView/>

  <div class="my-4">
    <router-view></router-view>
  </div>
</template>
