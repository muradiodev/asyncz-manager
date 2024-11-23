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
    <div class="container">
      <a class="navbar-brand" href="#">
        {{ user.company.name }} <br>
      </a>
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
            <router-link class="nav-link" :to="{name: 'branches'}"  v-if="user.role!=='expert'">Branches</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :to="{name: 'experts'}" v-if="user.role!=='expert'">Experts</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :to="{name: 'users'}" v-if="user.role==='manager'">Users</router-link>
          </li>
          <li class="nav-item" v-if="user.role==='manager'">
            <router-link class="nav-link" :to="{name: 'procedures'}">Procedures</router-link>
          </li>
        </ul>
      </div>

      <div class="ms-auto">
        <span >{{ user.name }}</span>
        <span class="badge bg-primary small ms-2">{{ user.role }}</span>
      </div>
    </div>
  </nav>
</template>

<style scoped>


</style>
