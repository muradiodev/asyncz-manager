<template>
  <CCard class="border-0 rounded-0">
    <CCardBody>
      <CContainer class="px-4" lg>
        <div class="mb-4">
          <AppBreadcrumb :breadcrumbs="[
            { name: 'Dashboard', path: '/dashboard', active: false },
            { name: 'Business Settings', path: '/dashboard/business-settings', active: true }
          ]" />
        </div>

        <div class="d-flex align-items-center justify-content-between w-100">
          <span class="h2 mb-0">Business Settings</span>
        </div>
      </CContainer>
    </CCardBody>
  </CCard>

  <CContainer class="px-4 pb-4" lg>
    <div class="card border-0 shadow-sm">
      <div class="card-body p-4">
        <form @submit.prevent>
          <!-- Business Name -->
          <div class="mb-4">
            <label for="businessName" class="form-label fw-bold">Business Name</label>
            <input
              type="text"
              class="form-control"
              id="businessName"
              value="MyTestGroomingBusiness"
            />
            <div class="text-warning small mt-1">
              <fa-icon :icon="['fas','exclamation-triangle']" class="me-1"></fa-icon>
              Updating your business name will also update your online form link (slug)
            </div>
          </div>

          <!-- Business Address -->
          <div class="mb-4">
            <label for="businessAddress" class="form-label fw-bold">Business Address</label>
            <textarea
              class="form-control"
              id="businessAddress"
              rows="3"
            >1108, Regal Tower, Business Bay St-Dubai - United Arab Emirates</textarea>
          </div>

          <!-- Business Phone -->
          <div class="mb-4">
            <label for="businessPhone" class="form-label fw-bold">Business Phone</label>
            <input
              type="tel"
              class="form-control"
              id="businessPhone"
              value="+994505883149"
            />
          </div>

          <!-- Business Email -->
          <div class="mb-4">
            <label for="businessEmail" class="form-label fw-bold">Business Email</label>
            <input
              type="email"
              class="form-control"
              id="businessEmail"
              value="is.elxan@gmail.com"
            />
          </div>

          <!-- Business Timezone -->
          <div class="mb-4">
            <label for="businessTimezone" class="form-label fw-bold">Business Timezone</label>
            <select
              class="form-select"
              id="businessTimezone"
            >
              <option value="Eastern Time - Toronto (EST/EDT)" selected>Eastern Time - Toronto (EST/EDT)</option>
              <option value="Central Time (CST/CDT)">Central Time (CST/CDT)</option>
              <option value="Mountain Time (MST/MDT)">Mountain Time (MST/MDT)</option>
              <option value="Pacific Time (PST/PDT)">Pacific Time (PST/PDT)</option>
              <option value="UTC">UTC</option>
              <option value="GMT">GMT</option>
              <option value="CET">Central European Time (CET)</option>
            </select>
          </div>

          <!-- Action Buttons-->
          <div class="col-12">
            <button type="submit" class="btn btn-primary-custom">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </CContainer>
</template>

<script>
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'

export default {
  name: 'BusinessSettingsView',
  components: { AppBreadcrumb }
}
</script>
