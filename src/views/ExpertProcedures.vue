<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title mb-0">{{ $t('expertProcedures.title') }}</h5>
    </div>

    <div class="list-group list-group-flush">
      <div class="list-group-item">
        <!-- Loading state for initial data load -->
        <div v-if="isInitialLoading" class="d-flex justify-content-center align-items-center py-4">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">{{ $t('general.loading') }}</span>
          </div>
        </div>

        <!-- Procedure list - only shown after everything is loaded -->
        <div v-else>
          <div
            class="form-check form-switch my-2"
            v-for="procedure in procedureList"
            :key="procedure.id"
          >
            <input
              class="form-check-input"
              type="checkbox"
              role="switch"
              :id="`procedure-${procedure.id}`"
              :checked="procedure.expertProcedure > 0"
              :disabled="loadingProcedures.includes(procedure.id)"
              @change.prevent="updateExpertProcedure(procedure, $event.target.checked)"
            />
            <label class="form-check-label" :for="`procedure-${procedure.id}`">
              <span v-if="loadingProcedures.includes(procedure.id)" class="spinner-border spinner-border-sm me-2" role="status">
                <span class="visually-hidden">Loading...</span>
              </span>
              {{ procedure.name }}
              <span class="badge bg-secondary ms-2">
                {{ procedure.length }} {{ $t('expertProcedures.lengthUnit') }}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { getProcedures } from '@/repositories/ProceduresRepository.js'
import { addExpertProcedure, getExpertProcedures, removeExpertProcedure } from '@/repositories/ExpertsRepository.js'
import { useAuthStore } from '@/stores/auth.js'
import { toast } from 'vue3-toastify'

export default {
  name: 'ExpertProcedures',
  props: {
    expertId: {}
  },
  data() {
    return {
      procedures: [],
      expertProcedures: [],
      loadingProcedures: [], // Array to track which procedures are currently being updated
      isInitialLoading: true, // Flag to show/hide the entire component during initial load
      dataLoadedCount: 0 // Counter to track when both API calls are complete
    }
  },

  computed: {
    ...mapState(useAuthStore, ['user', 'token']),

    procedureList() {
      let list = []

      this.procedures.forEach(procedure => {
        let expertProcedures = this.expertProcedures.find(dp => dp.procedure.id === procedure.id)

        list.push({
          id: procedure.id,
          name: procedure.name,
          length: procedure.length,
          expertProcedure: expertProcedures ? expertProcedures.id : null
        })
      })

      list.sort((a, b) => (b.expertProcedure || 0) - (a.expertProcedure || 0))

      return list
    }
  },

  methods: {
    async getProcedures() {
      try {
        const procedures = await getProcedures(this.token)
        this.procedures = procedures
        this.checkInitialLoadingComplete()
      } catch (error) {
        console.error('Error fetching procedures:', error)
        toast.error('Failed to load procedures')
        this.isInitialLoading = false
      }
    },

    async getExpertProcedures() {
      // For updates (not initial load), don't affect the loading state
      const isUpdate = this.dataLoadedCount >= 2

      try {
        const expertProcedures = await getExpertProcedures(this.token, this.expertId)
        this.expertProcedures = expertProcedures

        if (!isUpdate) {
          this.checkInitialLoadingComplete()
        }
      } catch (error) {
        console.error('Error fetching expert procedures:', error)
        if (!isUpdate) {
          toast.error('Failed to load expert procedures')
          this.isInitialLoading = false
        }
      }
    },

    checkInitialLoadingComplete() {
      this.dataLoadedCount++
      // Both API calls completed
      if (this.dataLoadedCount >= 2) {
        this.isInitialLoading = false
      }
    },

    async updateExpertProcedure(procedure, checked) {
      // Add procedure to loading state
      this.loadingProcedures.push(procedure.id)

      try {
        if (checked) {
          if (procedure.expertProcedure) {
            toast.error('This procedure is already added to the expert')
            await this.getExpertProcedures()
          } else {
            await addExpertProcedure(this.token, this.expertId, procedure.id)
            await this.getExpertProcedures()
          }
        } else {
          if (!procedure.expertProcedure) {
            toast.error('This procedure is already removed from the expert')
            await this.getExpertProcedures()
          } else {
            const result = await this.$swal({
              title: 'Are you sure?',
              text: 'This procedure will be removed from the expert',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Yes',
              cancelButtonText: 'No'
            })

            if (result.isConfirmed) {
              await removeExpertProcedure(this.token, procedure.expertProcedure)
              await this.getExpertProcedures()
            }
          }
        }
      } catch (error) {
        console.error('Error updating expert procedure:', error)
        toast.error('An error occurred while updating the expert procedure')
      } finally {
        // Remove procedure from loading state
        this.loadingProcedures = this.loadingProcedures.filter(id => id !== procedure.id)
      }
    }
  },

  async mounted() {
    // Load both data sets in parallel
    await Promise.all([
      this.getProcedures(),
      this.getExpertProcedures()
    ])
  }
}
</script>

<style scoped>
.form-check-input:disabled {
  opacity: 0.5;
}

.form-check-label {
  display: flex;
  align-items: center;
}

.spinner-border-sm {
  width: 0.875rem;
  height: 0.875rem;
}

.py-4 {
  padding-top: 1.5rem !important;
  padding-bottom: 1.5rem !important;
}

.ms-2 {
  margin-left: 0.5rem !important;
}
</style>
