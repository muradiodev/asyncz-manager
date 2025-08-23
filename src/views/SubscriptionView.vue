<!-- src/views/SubscriptionView.vue -->
<template>
  <CCard class="mb-4 border-0 rounded-0">
    <CCardBody>
      <CContainer class="px-4" lg>
        <div class="mb-4">
          <AppBreadcrumb
            :breadcrumbs="[
              { name: $t('navigation.dashboard'), path: '/dashboard', active: false },
              { name: $t('subscription.title'), path: '/dashboard/subscription', active: true }
            ]"
          />
        </div>

        <div class="d-flex align-items-center justify-content-between w-100">
          <span class="h2 mb-0">{{ $t('subscription.title') }}</span>
        </div>
      </CContainer>
    </CCardBody>
  </CCard>

  <CContainer class="px-4" lg>
    <!-- Non-manager view -->
    <div class="mb-4" v-if="!isManager">
      <!-- Has active subscription -->
      <div v-if="companyPackage" class="card border-0 shadow-sm">
        <div class="card-body">
          <div class="d-flex align-items-center mb-2">
            <div class="icon-bg bg-primary-subtle rounded-circle p-2 me-3">
              <fa-icon icon="check-circle" class="text-primary" />
            </div>
            <h5 class="mb-0">{{ $t('subscription.nonManager.active.title') }}</h5>
          </div>
          <p>
            {{
              $t('subscription.nonManager.active.text', {
                name: companyPackage?.name ?? '',
                until: companyPackage?.activeUntil ?? ''
              })
            }}
          </p>
        </div>
      </div>

      <!-- No visible info for non-manager -->
      <div v-else class="card border-0 shadow-sm">
        <div class="card-body">
          <div class="d-flex align-items-center mb-2">
            <div class="icon-bg bg-warning-subtle rounded-circle p-2 me-3">
              <fa-icon icon="exclamation-triangle" class="text-warning" />
            </div>
            <h5 class="mb-0">{{ $t('subscription.nonManager.notice.title') }}</h5>
          </div>
          <p>{{ $t('subscription.nonManager.notice.text') }}</p>
        </div>
      </div>
    </div>

    <!-- Manager view -->
    <div v-else>
      <!-- Current Subscription -->
      <div class="card border-0 shadow-sm mb-4" v-if="companyPackage">
        <div class="card-body pt-2">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 class="mb-0">{{ companyPackage.name }}</h4>
            <div class="text-end">
              <h4 class="mb-0">
                {{
                  companyPackage.price > 0
                    ? companyPackage.price + '$'
                    : $t('subscription.manager.planPicker.price.free')
                }}
              </h4>
              <span class="badge bg-primary" v-if="companyPackage.isTrial">
                {{ $t('subscription.manager.current.trialBadge') }}
              </span>
            </div>
          </div>

          <p class="small text-muted mb-4">
            {{ $t('subscription.manager.current.validUntil', { date: companyPackage.activeUntil }) }}
          </p>

          <div class="row mb-3">
            <div class="col-md-6">
              <div class="mb-3">
                <div class="d-flex justify-content-between">
                  <div>
                    <fa-icon icon="building" fixed-width class="text-muted me-2" />
                    {{ $t('subscription.manager.current.features.branches') }}
                  </div>
                  <div>
                    <span class="text-secondary">{{ company.branches }}</span>
                    / {{ companyPackage.branches }}
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <div class="d-flex justify-content-between">
                  <div>
                    <fa-icon icon="user" fixed-width class="text-muted me-2" />
                    {{ $t('subscription.manager.current.features.experts') }}
                  </div>
                  <div>
                    <span class="text-secondary">{{ company.experts }}</span>
                    / {{ companyPackage.experts }}
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-between">
                <div>
                  <fa-icon icon="ban" fixed-width class="text-muted me-2" />
                  {{ $t('subscription.manager.current.features.blacklist') }}
                </div>
                <div>
                  <fa-icon icon="check" v-if="companyPackage.blacklist" fixed-width class="text-success" />
                  <fa-icon icon="times" v-else fixed-width class="text-danger" />
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="mb-3">
                <div class="d-flex justify-content-between">
                  <div>
                    <fa-icon icon="list-check" fixed-width class="text-muted me-2" />
                    {{ $t('subscription.manager.current.features.procedures') }}
                  </div>
                  <div>
                    <span class="text-secondary">{{ company.procedures }}</span>
                    / {{ companyPackage.procedures }}
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <div class="d-flex justify-content-between">
                  <div>
                    <fa-icon icon="file-text" fixed-width class="text-muted me-2" />
                    {{ $t('subscription.manager.current.features.appointments') }}
                  </div>
                  <div class="text-success">{{ $t('subscription.common.unlimited') }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card-footer bg-white border-top-0 pb-4">
          <button type="button" class="btn btn-outline-danger-custom" @click.prevent="cancelSubscription">
            <fa-icon icon="times" fixed-width class="me-1" />
            {{ $t('subscription.manager.current.actions.cancel') }}
          </button>
        </div>
      </div>

      <!-- No active subscription warning -->
      <div v-if="!companyPackage" class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <div class="d-flex align-items-center mb-2">
            <div class="icon-bg bg-warning-subtle rounded-circle p-2 me-3">
              <fa-icon icon="exclamation-triangle" class="text-warning" />
            </div>
            <h5 class="mb-0">{{ $t('subscription.manager.empty.title') }}</h5>
          </div>
          <p>{{ $t('subscription.manager.empty.text') }}</p>
        </div>
      </div>

      <!-- Package selection -->
      <div v-if="packageList.length > 0">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">{{ $t('subscription.manager.planPicker.title') }}</h5>
          <div class="btn-group">
            <button
              class="btn btn-sm"
              :class="{'btn-secondary text-white': period === 'monthly', 'btn-outline-secondary': period !== 'monthly'}"
              @click="period = 'monthly'"
            >
              {{ $t('subscription.manager.planPicker.period.monthly') }}
            </button>

            <button
              class="btn btn-sm"
              :class="{'btn-secondary text-white': period === 'yearly', 'btn-outline-secondary': period !== 'yearly'}"
              @click="period = 'yearly'"
            >
              {{ $t('subscription.manager.planPicker.period.yearly') }}
            </button>
          </div>
        </div>

        <div class="row">
          <div class="col-md-4 mb-4" v-for="pack in packageList" :key="pack.id">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body">
                <h5 class="mb-2">{{ pack.name }}</h5>
                <p class="text-muted small mb-3">{{ pack.description }}</p>

                <div class="mb-3">
                  <div v-if="period === 'monthly'">
                    <h3 class="mb-0" v-if="pack.price > 0">
                      {{ pack.price }}$
                      <span class="text-muted fs-6">{{ $t('subscription.manager.planPicker.period.perMonth') }}</span>
                    </h3>
                    <h3 class="mb-0 text-success" v-else>
                      {{ $t('subscription.manager.planPicker.price.free') }}
                    </h3>
                  </div>
                  <div v-else>
                    <h3 class="mb-0" v-if="pack.yearlyPrice > 0">
                      {{ pack.yearlyPrice }}$
                      <span class="text-muted fs-6">{{ $t('subscription.manager.planPicker.period.perYear') }}</span>
                    </h3>
                    <h3 class="mb-0 text-success" v-else>
                      {{ $t('subscription.manager.planPicker.price.free') }}
                    </h3>
                  </div>
                </div>

                <hr class="my-3" />

                <div class="mb-3">
                  <div class="d-flex justify-content-between mb-2">
                    <div>
                      <fa-icon icon="building" fixed-width class="text-muted me-2" />
                      {{ $t('subscription.manager.planPicker.features.branches') }}
                    </div>
                    <div>{{ pack.branches }}</div>
                  </div>

                  <div class="d-flex justify-content-between mb-2">
                    <div>
                      <fa-icon icon="user" fixed-width class="text-muted me-2" />
                      {{ $t('subscription.manager.planPicker.features.experts') }}
                    </div>
                    <div>{{ pack.experts }}</div>
                  </div>

                  <div class="d-flex justify-content-between mb-2">
                    <div>
                      <fa-icon icon="list-check" fixed-width class="text-muted me-2" />
                      {{ $t('subscription.manager.planPicker.features.procedures') }}
                    </div>
                    <div>{{ pack.procedures }}</div>
                  </div>

                  <div class="d-flex justify-content-between mb-2">
                    <div>
                      <fa-icon icon="file-text" fixed-width class="text-muted me-2" />
                      {{ $t('subscription.manager.planPicker.features.appointments') }}
                    </div>
                    <div class="text-success">{{ $t('subscription.common.unlimited') }}</div>
                  </div>

                  <div class="d-flex justify-content-between mb-2">
                    <div>
                      <fa-icon icon="ban" fixed-width class="text-muted me-2" />
                      {{ $t('subscription.manager.planPicker.features.blacklist') }}
                    </div>
                    <div>
                      <fa-icon icon="check" v-if="pack.blacklist" fixed-width class="text-success" />
                      <fa-icon icon="times" v-else fixed-width class="text-danger" />
                    </div>
                  </div>
                </div>

                <hr class="my-3" />

                <div class="mb-3">
                  <div
                    v-for="f in (pack.features || '').split('\n')"
                    :key="f"
                    class="d-flex align-items-start mb-2"
                  >
                    <fa-icon icon="check" fixed-width class="text-success mt-1 me-2" />
                    <span>{{ f }}</span>
                  </div>
                </div>
              </div>

              <div class="card-footer bg-white border-top-0 pb-4">
                <div class="d-grid">
                  <button class="btn btn-primary-custom" @click="subscribeToPackage(pack.id)">
                    {{ $t('subscription.manager.planPicker.actions.selectPlan') }}
                  </button>
                </div>

                <div class="text-success text-center mt-2" v-if="pack.trialDays > 0 && !company.trialUsed">
                  <small>
                    <fa-icon icon="info-circle" class="me-1" />
                    {{ $t('subscription.manager.planPicker.trialAvailable', { days: pack.trialDays }) }}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> <!-- /Package selection -->

      <!-- No packages available warning -->
      <div v-if="packageList.length < 1" class="card border-0 shadow-sm">
        <div class="card-body">
          <div class="d-flex align-items-center mb-2">
            <div class="icon-bg bg-warning-subtle rounded-circle p-2 me-3">
              <fa-icon icon="exclamation-triangle" class="text-warning" />
            </div>
            <h5 class="mb-0">{{ $t('subscription.manager.noPackages.title') }}</h5>
          </div>
          <p>{{ $t('subscription.manager.noPackages.text') }}</p>
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
      period: 'monthly',
      isLoading: false
    }
  },
  computed: {
    ...mapState(useAuthStore, ['token', 'user', 'company', 'companyPackage']),
    isManager() {
      return this.user?.role === 'manager'
    }
  },
  methods: {
    loadPackageList() {
      this.isLoading = true
      getPackageList(this.token)
        .then(res => {
          this.packageList = res
          this.isLoading = false
        })
        .catch(err => {
          this.isLoading = false
          customAlert(this.$t('general.error'), err.message, 'error')
        })
    },
    subscribeToPackage(packageId) {
      customAsk(
        this.$t('subscription.dialogs.subscribeConfirm.title'),
        this.$t('subscription.dialogs.subscribeConfirm.text'),
        'question',
        () => {
          subscribe(this.token, packageId, this.period)
            .then(res => {
              if (res.code === 200) {
                customAlert(
                  this.$t('subscription.dialogs.subscribeSuccess.title'),
                  this.$t('subscription.dialogs.subscribeSuccess.text'),
                  'success',
                  () => window.location.reload()
                )
              } else if (res.code === 201) {
                customAlert(
                  this.$t('subscription.dialogs.paymentRequired.title'),
                  this.$t('subscription.dialogs.paymentRequired.text'),
                  'info',
                  () => {
                    window.location.href = res.url
                  }
                )
              } else {
                customAlert(`${this.$t('general.error')} ${res.code}`, res.message, 'error')
              }
            })
            .catch(err => {
              customAlert(this.$t('general.error'), err.message, 'error')
            })
        }
      )
    },
    cancelSubscription() {
      customAsk(
        this.$t('subscription.dialogs.cancelConfirm.title'),
        this.$t('subscription.dialogs.cancelConfirm.text'),
        'warning',
        () => {
          cancelSubscription(this.token)
            .then(res => {
              if (res.code === 200) {
                customAlert(
                  this.$t('subscription.dialogs.cancelSuccess.title'),
                  this.$t('subscription.dialogs.cancelSuccess.text'),
                  'success',
                  () => window.location.reload()
                )
              } else {
                customAlert(`${this.$t('general.error')} ${res.code}`, res.message, 'error')
              }
            })
            .catch(err => {
              customAlert(this.$t('general.error'), err.message, 'error')
            })
        },
        () => {
          /* user cancelled */
        }
      )
    }
  },
  mounted() {
    this.loadPackageList()
  }
}
</script>