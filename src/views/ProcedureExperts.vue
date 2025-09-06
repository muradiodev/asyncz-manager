<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title mb-0">{{ $t('experts.title') }}</h5>
    </div>

    <div class="list-group list-group-flush">
      <div class="list-group-item">
        <!-- Loading state for initial data load -->
        <div v-if="isInitialLoading" class="d-flex justify-content-center align-items-center py-4">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">{{ $t('general.loading') }}</span>
          </div>
        </div>

        <!-- Expert list - only shown after everything is loaded -->
        <div v-else>
          <div
            class="form-check form-switch my-2"
            v-for="expert in expertList"
            :key="expert.id"
          >
            <input
              class="form-check-input"
              type="checkbox"
              role="switch"
              :id="`expert-${expert.id}`"
              :checked="expert.expertProcedure > 0"
              :disabled="loadingExperts.includes(expert.id)"
              @change.prevent="updateExpertProcedure(expert, $event.target.checked)"
            />
            <label class="form-check-label" :for="`expert-${expert.id}`">
              <span v-if="loadingExperts.includes(expert.id)" class="spinner-border spinner-border-sm me-2" role="status">
                <span class="visually-hidden">Loading...</span>
              </span>
              {{ expert.fullName }}
              <span class="badge bg-secondary ms-2" v-if="expert.branch">
              {{ expert.branch }}
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
import { getExperts, addExpertProcedure, getExpertProcedures, removeExpertProcedure } from '@/repositories/ExpertsRepository.js'
import { useAuthStore } from '@/stores/auth.js'
import { toast } from 'vue3-toastify'

export default {
  name: 'ProcedureExperts',
  props: {
    procedureId: {}
  },
  data() {
    return {
      experts: [],
      expertProcedures: [],
      loadingExperts: [], // Array to track which experts are currently being updated
      isInitialLoading: true // Flag to show/hide the entire component during initial load
    }
  },

  computed: {
    ...mapState(useAuthStore, ['user', 'token']),

    expertList() {
      let list = []

      this.experts.forEach(expert => {
        let expertProcedure = this.expertProcedures.find(ep => ep.expert.id === expert.id && ep.procedure.id == this.procedureId)

        list.push({
          id: expert.id,
          fullName: expert.fullName,
          branch: expert.branch ? expert.branch.name : null,
          expertProcedure: expertProcedure ? expertProcedure.id : null
        })
      })

      list.sort((a, b) => (b.expertProcedure || 0) - (a.expertProcedure || 0))

      return list
    }
  },
  methods: {
    async getExperts() {
      try {
        const experts = await getExperts(this.token)
        this.experts = experts
      } catch (error) {
        console.error('Error fetching experts:', error)
        toast.error('Failed to load experts')
        this.isInitialLoading = false
      }
    },

    async getExpertProcedures() {
      // For updates (not initial load), don't reset the loading state
      const isUpdate = !this.isInitialLoading

      try {
        // Get all expert procedures and filter by procedure ID in computed
        const promises = this.experts.map(expert =>
          getExpertProcedures(this.token, expert.id)
        )

        const results = await Promise.all(promises)
        this.expertProcedures = results.flat()

        // Only set initial loading to false after everything is loaded
        if (!isUpdate) {
          this.isInitialLoading = false
        }
      } catch (error) {
        console.error('Error fetching expert procedures:', error)
        if (!isUpdate) {
          toast.error('Failed to load expert procedures')
          this.isInitialLoading = false
        }
      }
    },

    async updateExpertProcedure(expert, checked) {
      // Add expert to loading state
      this.loadingExperts.push(expert.id)

      try {
        if (checked) {
          if (expert.expertProcedure) {
            toast.error('This expert already has this procedure assigned')
            await this.getExpertProcedures()
          } else {
            await addExpertProcedure(this.token, expert.id, this.procedureId)
            await this.getExpertProcedures()
          }
        } else {
          if (!expert.expertProcedure) {
            toast.error('This expert does not have this procedure assigned')
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
              await removeExpertProcedure(this.token, expert.expertProcedure)
              await this.getExpertProcedures()
            }
          }
        }
      } catch (error) {
        console.error('Error updating expert procedure:', error)
        toast.error('An error occurred while updating the expert procedure')
      } finally {
        // Remove expert from loading state
        this.loadingExperts = this.loadingExperts.filter(id => id !== expert.id)
      }
    }
  },
  watch: {
    async experts() {
      if (this.experts.length > 0) {
        await this.getExpertProcedures()
      }
    }
  },
  async mounted() {
    await this.getExperts()
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
</style>
