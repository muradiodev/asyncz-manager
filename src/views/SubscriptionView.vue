<template>

  <CCard class="mb-4 border-0 rounded-0">
    <CCardBody>
      <CContainer class="px-4" lg>

        <div class="mb-4">
          <AppBreadcrumb :breadcrumbs="[
            { name: 'Dashboard', path: '/dashboard', active: false },
            { name: 'Subscription', path: '/dashboard/subscription', active: true }
          ]" />
        </div>

        <div class="d-flex align-items-center justify-content-between w-100">
          <span class="h2 mb-0">Subscription</span>
        </div>
      </CContainer>
    </CCardBody>
  </CCard>


  <CContainer class="px-4" lg>


    <div class="mb-4" v-if="user.role !== 'manager'">
      <div v-if="companyPackage">
        <div class="alert alert-success">
          You have an active subscription. <br>
          <strong>{{ companyPackage.name }}</strong> package is active until <strong>{{ companyPackage.activeUntil
          }}</strong>.
        </div>
      </div>
      <div v-else class="alert alert-warning">
        Your company is subscribed to a package. Please contact your administrator for more information.
      </div>
    </div>

    <div v-else>

      <div v-if="companyPackage">

        <div class="card">
          <div class="card-header">
            Active subscription
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <h3 class="mb-0">{{ companyPackage.name }}</h3>

              <p class="lead fw-bold">
                {{ companyPackage.price > 0 ? companyPackage.price + ' AZN' : 'FREE' }}
              </p>
            </div>

          </div>
          <div class="card-body">
            <table class="w-100">
              <tbody>
              <tr>
                <td>
                  <fa-icon icon="building" fixed-width />
                  Branches:
                </td>
                <td class="text-end">
                  <span class="text-secondary">
                  {{ company.branches }}
                  </span> /
                  {{ companyPackage.branches }}
                </td>
              </tr>
              <tr>
                <td>
                  <fa-icon icon="user" fixed-width />
                  Experts:
                </td>
                <td class="text-end">
                  <span class="text-secondary">
                  {{ company.experts }}
                  </span> /
                  {{ companyPackage.experts }}
                </td>
              </tr>
              <tr>
                <td>
                  <fa-icon icon="list-check" fixed-width />
                  Procedures:
                </td>
                <td class="text-end">
                  <span class="text-secondary">
                  {{ company.procedures }}
                  </span> /
                  {{ companyPackage.procedures }}
                </td>
              </tr>
              <tr>
                <td>
                  <fa-icon icon="file-text" fixed-width />
                  Appointments:
                </td>
                <td class="text-end text-success">unlimited</td>
              </tr>
              <tr>
                <td>
                  <fa-icon icon="ban" fixed-width />
                  Blacklist:
                </td>
                <td class="text-end">
                  <fa-icon icon="check" v-if="companyPackage.blacklist" fixed-width class="text-success me-2" />
                  <fa-icon icon="times" v-else fixed-width class="text-danger me-2" />
                </td>
              </tr>
              </tbody>
            </table>
          </div>

          <div class="card-body">
            <p>
              Valid until: <strong>{{ companyPackage.activeUntil }}</strong>

              <span class="badge bg-primary ms-3" v-if="companyPackage.isTrial">Trial</span>
            </p>
          </div>

          <div class="card-footer">
            <div>
              <button type="button" class="btn btn-outline-danger" @click.prevent="cancelSubscription">
                <fa-icon icon="times" fixed-width />
                Cancel subscription
              </button>
            </div>
          </div>

        </div>

      </div>
      <div v-else>

        <div class="alert alert-warning">
          You dont have active subscription. Please choose a package from a list below.
        </div>

        <div class="row">
          <div class="col-12" v-if="packageList.length<1">
            <div class="alert alert-warning">
              There are no packages available at the moment. Please try again later or contact support.
            </div>

          </div>


          <div class="text-center mb-4">
            <div class="btn-group">
              <button class="btn"
                      :class="{'btn-primary': period === 'monthly', 'btn-outline-primary': period!=='monthly'}"
                      @click="period = 'monthly'">Monthly
              </button>
              <button class="btn"
                      :class="{'btn-primary': period === 'yearly', ' btn-outline-primary': period!=='yearly'}"
                      @click="period = 'yearly'">Yearly
              </button>
            </div>
          </div>


          <div class="col-md-6 col-lg-4 col-xl-4 mb-3" v-for="pack in packageList" :key="pack.id">

            <div class="card h-100">
              <div class="card-body">
                <h3>{{ pack.name }}</h3>
                <p>
                  {{ pack.description }}
                </p>
              </div>
              <div class="card-body">
                <table class="w-100">
                  <tbody>
                  <tr>
                    <td>
                      <fa-icon icon="building" fixed-width />
                      Branches:
                    </td>
                    <td class="text-end">
                      {{ pack.branches }}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <fa-icon icon="user" fixed-width />
                      Experts:
                    </td>
                    <td class="text-end">{{ pack.experts }}</td>
                  </tr>
                  <tr>
                    <td>
                      <fa-icon icon="list-check" fixed-width />
                      Procedures:
                    </td>
                    <td class="text-end">{{ pack.procedures }}</td>
                  </tr>
                  <tr>
                    <td>
                      <fa-icon icon="file-text" fixed-width />
                      Appointments:
                    </td>
                    <td class="text-end text-success">unlimited</td>
                  </tr>
                  <tr>
                    <td>
                      <fa-icon icon="ban" fixed-width />
                      Blacklist:
                    </td>
                    <td class="text-end">
                      <fa-icon icon="check" v-if="pack.blacklist" fixed-width class="text-success ms-2" />
                      <fa-icon icon="times" v-else fixed-width class="text-danger ms-2" />
                    </td>
                  </tr>
                  </tbody>
                </table>
                <br>
                <div v-for="f in pack.features.split('\n')" :key="f">
                  <fa-icon icon="check" fixed-width class="text-success me-2" />
                  {{ f }}
                </div>

              </div>
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div v-if="period==='monthly'">
                    <span class="h4" v-if="pack.price>0">{{ pack.price }} AZN</span>
                    <span class="h4 text-success" v-else>FREE</span>
                  </div>
                  <div v-else>
                    <span class="h4" v-if="pack.yearlyPrice>0">{{ pack.yearlyPrice }} AZN</span>
                    <span class="h4 text-success" v-else>FREE</span>
                  </div>
                  <button class="btn btn-primary" @click="subscribeToPackage(pack.id)">Subscribe</button>
                </div>
                <div class="text-success fw-bold text-end" v-if="pack.trialDays>0 && !company.trialUsed">
                  {{ pack.trialDays }} days trial available
                </div>
              </div>
            </div>


          </div>

        </div>


      </div>
    </div>


  </CContainer>


</template>

<script>


import { useAuthStore } from '@/stores/auth.js'
import { mapState } from 'pinia'
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import { cancelSubscription, getPackageList, subscribe } from '@/repositories/SubscriptionRepository.js'
import { customAlert, customAsk } from '@/utils/utils.js'
import { FontAwesomeIcon as FaIcon } from '@fortawesome/vue-fontawesome'

export default {
  name: 'SubscriptionView',
  components: { FaIcon, AppBreadcrumb },
  data() {
    return {
      packageList: [],
      period: 'monthly'
    }
  },
  watch: {},
  computed: {
    ...mapState(useAuthStore, ['token', 'user', 'company', 'companyPackage'])

  },
  methods: {

    loadPackageList() {
      this.isLoading = true
      getPackageList(this.token).then(res => {
        this.packageList = res
        this.isLoading = false
      }).catch(err => {
        this.isLoading = false
        customAlert('Error', err.message, 'error')
      })
    },


    subscribeToPackage(packageId) {

      customAsk('Subscription', 'Are you sure you want to subscribe to this package?', 'question', () => {

          subscribe(this.token, packageId, this.period).then(res => {
            if (res.code === 200) {
              customAlert('Success', 'You have successfully subscribed to the package.', 'success', () => {
                window.location.reload()
              })
            } else if (res.code === 201) {
              //redirect to payment page
              customAlert('Payment Required', 'You need to complete the payment to activate your subscription.', 'info', () => {
                window.location.href = res.url;
              });
            } else {
              customAlert(`Error ${res.code}`, res.message, 'error')
            }
          }).catch(err => {
            customAlert('Error', err.message, 'error')
          })

        }
      )

    },
    cancelSubscription() {

      customAsk('Cancel Subscription', 'Are you sure you want to cancel your subscription? This action cannot be undone.', 'warning', () => {
        cancelSubscription(this.token).then(res => {
          if (res.code === 200) {
            customAlert('Success', 'Your subscription has been cancelled.', 'success', () => {
              window.location.reload()
            })
          } else {
            customAlert(`Error ${res.code}`, res.message, 'error')
          }
        }).catch(err => {
          customAlert('Error', err.message, 'error')
        })
      }, () => {
        // User cancelled the action, do nothing
      })

    }

  },
  mounted() {

    this.loadPackageList()

  }
}
</script>
