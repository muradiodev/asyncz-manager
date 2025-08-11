<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title mb-0">{{ $t('expertProcedures.title') }}</h5>
    </div>

    <div class="list-group list-group-flush">
      <div class="list-group-item">
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
            @change.prevent="updateExpertProcedure(procedure, $event.target.checked)"
          />
          <label class="form-check-label" :for="`procedure-${procedure.id}`">
            {{ procedure.name }}
            <span class="badge bg-secondary">
              {{ procedure.length }} {{ $t('expertProcedures.lengthUnit') }}
            </span>
          </label>
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
      expertProcedures: []
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
    getProcedures() {
      getProcedures(this.token).then(procedures => {
        this.procedures = procedures
      })
    },

    getExpertProcedures() {
      getExpertProcedures(this.token, this.expertId).then((expertProcedures) => {
        this.expertProcedures = expertProcedures
      })
    },

    updateExpertProcedure(procedure, checked) {
      if (checked) {
        if (procedure.expertProcedure) {
          toast.error('This procedure is already added to the expert');
          this.getExpertProcedures()
        } else {
          addExpertProcedure(this.token, this.expertId, procedure.id).then(() => {
            this.getExpertProcedures()
          })
        }
      } else {
        if (!procedure.expertProcedure) {
          toast.error('This procedure is already removed from the expert');
          this.getExpertProcedures();
        } else {
          this.$swal({
            title: 'Are you sure?',
            text: 'This procedure will be removed from the expert',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
          }).then((result) => {
            if (result.isConfirmed) {
              removeExpertProcedure(this.token, procedure.expertProcedure).then(() => {
                this.getExpertProcedures()
              })
            }
          })
        }
      }
    }
  },
  mounted() {
    this.getProcedures()
    this.getExpertProcedures()
  }
}
</script>