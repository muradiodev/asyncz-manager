<script>
import {useAuthStore} from "@/stores/auth.js";
import {mapState} from "pinia";

export default {
  name: "NavigationView",
  data() {
    return {};
  },
  computed: {
    ...mapState(useAuthStore, ["token", "user"]),
  },
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light" v-if="user">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">{{ user.company.name }}</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
              aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link class="nav-link" :to="{name: 'home'}">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :to="{name: 'calendar'}">Calendar</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :to="{name: 'experts'}">Experts</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :to="{name: 'procedures'}">Procedures</router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>


</style>