<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light" v-if="user">
    <div :class="containerClass">
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
            <router-link class="nav-link" :to="{name: 'branches'}" v-if="user.role!=='expert'">Branches</router-link>
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

      <div class="ms-auto d-flex">


        <div class="me-3 position-relative">
          <div class="input-group">
            <input class="form-control border-secondary" v-model.trim="searchKeyword" v-if="searchIsOpen">
            <button class="btn btn-outline-secondary" @click.prevent="searchIsOpen = true" v-if="!searchIsOpen">
              <fa-icon :icon="['fas','search']"></fa-icon>
            </button>
            <button class="btn btn-outline-secondary" @click.prevent="searchIsOpen = false; searchKeyword =''" v-else>
              <fa-icon :icon="['fas','times']"></fa-icon>
            </button>
          </div>
          <div class="searchResult">
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
          </div>
        </div>

        <!-- profile dropdown -->
        <div class="dropdown">
          <a class="btn btn-outline-secondary dropdown-toggle" href="#" role="button" id="dropdownMenuLink"
             data-bs-toggle="dropdown" aria-expanded="false">
            {{ user.name }}
          </a>

          <ul class="dropdown-menu" aria-labelledby="dropdownMenuLink">
            <li class="dropdown-item disabled"> {{ user.role }}</li>
            <li><router-link class="dropdown-item" :to="{name:'profile'}">Profile</router-link></li>
            <li><a class="dropdown-item" href="#" @click.prevent="logout">Logout</a></li>
          </ul>
        </div>

      </div>
    </div>
  </nav>
</template>
<script>
import { useAuthStore } from '@/stores/auth.js'
import { mapState } from 'pinia'
import { searchAppointment } from '@/repositories/AppointmentRepository.js'

export default {
  name: 'NavigationView',
  data() {
    return {
      searchKeyword: '',
      searchIsOpen: false,
      searchResult: [],
      searchInProgress: false,
      noResult: false
    }
  },
  computed: {
    ...mapState(useAuthStore, ['token', 'user']),
    containerClass() {
      if(this.$route.name==='calendar'){
        return 'container-fluid';
      }
      return 'container';
    }
  },
  watch: {

    searchKeyword(newVal) {
      this.noResult = false
      if (newVal.length < 3) {
        this.searchResult = []
        return
      }
      // search
      this.searchInProgress = true
      searchAppointment(this.token, newVal).then(res => {
        if (res.length < 1) {
          this.noResult = true
        }
        this.searchResult = res
        this.searchInProgress = false
      })

    },
    searchIsOpen(newVal) {
       //focus input
      if (newVal) {
        this.$nextTick(() => {
          this.$el.querySelector('input').focus()
        })
      }
    }

  },
  methods: {
    logout() {


      this.$swal({
        title: 'Logout',
        text: 'Are you sure you want to logout?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result) => {
        if (!result.isConfirmed) return

        localStorage.removeItem('token')
        window.location.reload()
      })
    },

    resultClicked(r) {

      this.searchKeyword = '';
      this.searchIsOpen = false;
      this.$router.push({ name: 'calendar', query: { open: 'appointment', appointment: r.id } })
    }
  }
}
</script>
<style lang="scss" scoped>

.searchResult {
  position: absolute;
  left: 0;
  right: 0;
  top: 36px;
  background-color: white;

  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;

  .searchResultItem {
    padding: 10px 5px;
    cursor: pointer;
    line-height: 1.1;
    border: 1px solid #ccc;

    &:hover {
      background-color: #f0f0f0;
    }
  }

}

</style>
