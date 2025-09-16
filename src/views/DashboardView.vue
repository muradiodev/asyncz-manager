<script>
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { useAuthStore } from '@/stores/auth.js'
import { mapState } from 'pinia'
import { getGuideData } from '@/repositories/GeneralDataRepository.js'

export default {
  name: 'DashboardView',
  components: { AppHeader, AppSidebar, AppFooter },
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

    ...mapState(useAuthStore, ['token', 'user', 'companyPackage']),

    fluid() {
      return this.$route.name === 'calendar'
    },

    ready() {
      // Check if the companyPackage is loaded and the route is not 'subscription'
      return this.companyPackage || this.$route.name === 'subscription'
    }
  },
  methods: {
    createTour(tourData) {
      this.tour = this.$shepherd({
        useModalOverlay: true
      })


      tourData.forEach((step, i) => {


        let buttons = []

        if (i > 0) {
          buttons.push({
            text: 'Back',
            action: this.tour.back,
            classes: 'shepherd-button-secondary'
          })
        }
        buttons.push({
          text: 'Close',
          action: this.tour.cancel,
          classes: 'shepherd-button-secondary bg-danger text-white'
        })

        if (i < tourData.length - 1) {
          buttons.push({
            text: 'Next',
            action: this.tour.next,
            classes: 'shepherd-button-primary'
          })

        }

        this.tour.addStep({
          attachTo: { element: step.element, on: step.placement },
          title: step.title,
          text: step.content,
          buttons: buttons,
          scrollTo: { behavior: 'smooth', block: 'center' },
          when: {
            show: () => {
            },
            hide: () => {
              //console.log('Hiding step: ' + step.title);
            }
          }
        })
      })
    }
  },
  mounted() {
    if (!this.companyPackage && this.$route.name !== 'subscription') {
      this.$router.push({ name: 'subscription' })
    } else {

      const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';

      getGuideData(this.user.role, savedLanguage).then(res => {
        if(res) {
          this.createTour(res.tour)
          let guideSeen = localStorage.getItem('guideSeen')
          if (!guideSeen || guideSeen !== 'yes') {
            this.tour.start()
            localStorage.setItem('guideSeen', 'yes')
          }
        }
      })
    }

  }
}
</script>

<template>


  <div>
    <AppSidebar />
    <div class="wrapper d-flex flex-column min-vh-100">
      <AppHeader />
      <div class="body flex-grow-1">
        <div v-if="ready">
          <router-view />
        </div>
      </div>
      <AppFooter />

      <!-- guide tour start button on bottom right -->
      <div class="position-fixed bottom-0 end-0 p-3" id="guide_button" style="z-index: 11">
        <button class="btn btn-primary  " @click="tour.start()">
          <i class="fas fa-question-circle fa-3"></i> Start a tour
        </button>
      </div>
    </div>
  </div>

</template>
