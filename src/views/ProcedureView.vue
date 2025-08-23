<template>
  <div class="container">
    <!-- breadcrumb -->
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link :to="{ name: 'home' }">{{ $t('navigation.home') }}</router-link>
        </li>
        <li class="breadcrumb-item">
          <router-link :to="{ name: 'procedures' }">{{ $t('procedures.title') }}</router-link>
        </li>
        <li class="breadcrumb-item active" aria-current="page" v-if="procedure">
          {{ procedure.name }}
        </li>
      </ol>
    </nav>

    <div v-if="!procedure">
      <!-- loading-->
      <div class="d-flex justify-content-center align-items-center vh-100">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">{{ $t('general.loading') }}</span>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="d-flex align-items-center">
        <span class="h2 mb-0">
          {{ procedure.name }}
        </span>
      </div>

      <div class="row mt-4">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body" v-if="!editing">
              <p>
                <strong>{{ $t('procedure.labels.about') }} </strong> <br />
                {{ procedure.about || '-' }}
                <br />
                <strong>{{ $t('procedure.labels.length') }} </strong>
                {{ procedure.length || '-' }} {{ $t('procedures.lengthUnit') }}
                <br />
                <strong>{{ $t('procedure.labels.status') }} </strong>
                <StatusBadge :status="procedure.status" />
                <br />
                <strong>{{ $t('procedure.labels.color') }} </strong>
                <span class="badge" :style="{ backgroundColor: procedure.color || '#ccc' }">
                  &nbsp;
                </span>
              </p>

              <button class="btn-outline-custom" @click.prevent="editing = true">{{ $t('procedure.actions.edit') }}</button>
            </div>
            <div class="card-body" v-else>
              <form @submit.prevent="saveProcedure">
                <div class="row">
                  <div class="col-md-12 mb-3">
                    <label for="name" class="form-label">{{ $t('procedure.form.labels.name') }}</label>
                    <input
                      type="text"
                      class="form-control"
                      id="name"
                      v-model="procedure.name"
                      required
                    />
                  </div>

                  <div class="col-md-12 mb-3">
                    <label for="about" class="form-label">{{ $t('procedure.form.labels.description') }}</label>
                    <textarea class="form-control" id="about" v-model="procedure.about"></textarea>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="length" class="form-label">{{ $t('procedure.form.labels.length') }}</label>
                    <div class="input-group">
                      <input
                        type="number"
                        class="form-control"
                        id="length"
                        v-model.number="procedure.length"
                        step="1"
                        required
                      />
                      <div class="input-group-text">{{ $t('procedures.lengthUnit') }}</div>
                    </div>
                  </div>

                  <!--  Color Section -->
                  <div class="col-md-6 mb-3">
                    <label for="color" class="form-label">{{ $t('procedure.form.labels.color') }}</label>

                    <div class="color-selector-container">
                      <div
                        class="selected-color-display"
                        @click="toggleColorPalette"
                        :style="{ backgroundColor: procedure.color || '#ccc' }"
                      >
                        <span v-if="!showColorPalette" class="color-hint">
                          <font-awesome-icon :icon="faPencil()" />
                        </span>
                      </div>

                      <div v-if="showColorPalette" class="color-palette-container">
                        <div class="color-palette">
                          <div
                            v-for="(color, index) in colorPalette"
                            :key="index"
                            class="color-swatch"
                            :class="{ selected: procedure.color === color }"
                            :style="{ backgroundColor: color }"
                            @click="selectColor(color)"
                          ></div>
                        </div>

                        <div class="mt-2 d-flex justify-content-between">
                          <div>&nbsp;&nbsp;&nbsp;</div>
                          <button
                            type="button"
                            class="btn btn-sm btn-outline-secondary"
                            @click="showColorPalette = false"
                          >
                            {{ $t('procedure.actions.closePalette') }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="color" class="form-label">{{ $t('procedure.form.labels.status') }}</label>
                    <select class="form-control" id="color" v-model="procedure.status" required>
                      <option :value="true">{{ $t('procedures.table.status.active') }}</option>
                      <option :value="false">{{ $t('procedures.table.status.inactive') }}</option>
                    </select>
                  </div>

                  <div class="col-md-12">
                    <button class="btn-success-custom">{{ $t('procedure.actions.save') }}</button>

                    <button class="btn-outline-custom" @click.prevent="editing = false">
                      {{ $t('procedure.actions.cancel') }}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div class="my-4" v-if="1 > 2">
        <DataTable class="table table-striped table-bordered" :columns="columns" :data="data">
        </DataTable>
      </div>
    </div>
  </div>

  <!-- This modal reuses existing expert labels; only the static title/button replaced -->
  <ModalComponent :title="$t('experts.modalCreate.title').toLowerCase()" v-if="addNewItem" @modalClose="addNewItem = false">
    <form @submit.prevent="createNewItem">
      <div class="row">
        <div class="col-md-12">
          <div class="mb-3">
            <label for="newUserName" class="form-label">{{ $t('experts.modalCreate.labels.fullName') }}</label>
            <input
              type="text"
              class="form-control"
              id="newUserName"
              v-model="newItemDetails.fullName"
              required
            />
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label for="newEmail" class="form-label">{{ $t('experts.modalCreate.labels.email') }}</label>
            <input
              type="email"
              class="form-control"
              id="newEmail"
              v-model="newItemDetails.email"
              required
            />
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label for="newPassword" class="form-label">{{ $t('experts.modalCreate.labels.password') }}</label>
            <input
              type="password"
              class="form-control"
              id="newPassword"
              v-model="newItemDetails.password"
              required
            />
          </div>
        </div>
        <div class="col-md-12">
          <button class="btn-success-custom">{{ $t('experts.modalCreate.actions.create') }}</button>
        </div>
      </div>
    </form>
  </ModalComponent>
</template>

<script>
import DataTable from 'datatables.net-vue3'
import DataTablesCore from 'datatables.net'
import DataTablesLib from 'datatables.net-bs5'

import { useAuthStore } from '@/stores/auth.js'
import { mapState } from 'pinia'
import ModalComponent from '@/components/ModalComponent.vue'
import StatusBadge from '@/views/StatusBadge.vue'
import { getProcedure, saveProcedure } from '@/repositories/ProceduresRepository.js'
import { toast } from 'vue3-toastify'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faPencil } from '@fortawesome/free-solid-svg-icons'

DataTable.use(DataTablesLib)
DataTable.use(DataTablesCore)

export default {
  name: 'ProcedureView',
  data() {
    return {
      procedure: null,

      editing: false,

      addNewItem: false,
      newItemDetails: {
        fullName: '',
        email: '',
        password: ''
      },

      showColorPalette: false,

      colorPalette: [
        // First row - light pastel colors
        '#d4f5e9',
        '#fbeaa0',
        '#fde5d4',
        '#ffd5d5',
        '#e5d4f5',
        // Second row - medium pastel colors
        '#77d4aa',
        '#ebc956',
        '#f4a87c',
        '#ee7e7e',
        '#b39ddb',
        // Third row - darker colors
        '#15a149',
        '#9e7b35',
        '#b25933',
        '#c13f3f',
        '#5e4294',
        // Fourth row - very light colors
        '#e6f0ff',
        '#d4f1f9',
        '#e8f7d4',
        '#fce4ec',
        '#e0e0e0',
        // Fifth row - medium bright colors
        '#5b9bd5',
        '#69c3d4',
        '#a8ce54',
        '#e67ab3',
        '#8c9099',
        // Sixth row - darker bright colors
        '#3464c4',
        '#2b7c93',
        '#6b8e23',
        '#b13e81',
        '#4e5561'
      ],

      expertList: [],
      columns: [
        { title: 'ID', data: 'id', orderable: true },
        { title: 'Name', data: 'fullName', orderable: true },
        {
          title: 'Status',
          data: (row) => {
            if (row.status) {
              return `<span class="badge bg-success">active</span>`
            } else {
              return `<span class="badge bg-danger">inactive</span>`
            }
          }
        },
        {
          title: 'Action',
          data: (row) => {
            return `<a href="./expert/${row.id}">manage</a>`
          }
        }
      ]
    }
  },
  watch: {
    procedureId() {
      this.getProcedure()
    },
    editing() {
      this.getProcedure()
    }
  },
  computed: {
    ...mapState(useAuthStore, ['token', 'user']),
    data() {
      return this.expertList
    },
    procedureId: {
      get() {
        return this.$route.params.id
      },
      set(value) {
        this.$router.push({ name: 'expert', params: { id: value } })
      }
    }
  },
  methods: {
    faPencil() {
      return faPencil
    },
    getProcedure() {
      getProcedure(this.token, this.procedureId).then((response) => {
        if (response.code === 200) {
          this.procedure = response.procedure
        } else {
          toast.error(response.message)
        }
      })
    },

    toggleColorPalette() {
      this.showColorPalette = !this.showColorPalette
    },

    selectColor(color) {
      this.procedure.color = color
      // Optional: close palette after selection
      // this.showColorPalette = false;
    },

    saveProcedure() {
      saveProcedure(
        this.token,
        this.procedureId,
        this.procedure.name,
        this.procedure.color,
        this.procedure.about,
        this.procedure.length,
        this.procedure.status ? 1 : 0
      ).then((response) => {
        if (response.code === 200) {
          this.editing = false
        } else {
          toast.error(response.message)
        }
      })
    }
  },
  mounted() {
    this.getProcedure()
  },
  components: {
    FontAwesomeIcon,
    StatusBadge,
    ModalComponent,
    DataTable
  }
}
</script>

<style scoped>
.color-selector-container {
  position: relative;
}

.selected-color-display {
  width: 100%;
  height: 40px;
  border-radius: 4px;
  border: 1px solid #ddd;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.selected-color-display:hover {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.color-hint {
  color: rgba(0, 0, 0, 0.5);
  text-shadow: 0px 0px 2px rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.color-palette-container {
  margin-top: 10px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.color-palette {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  max-width: 100%;
}

.color-swatch {
  width: 100%;
  aspect-ratio: 1.5 / 1;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #ddd;
}

.color-swatch:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.color-swatch.selected {
  border: 3px solid #1976d2;
  box-shadow: 0 0 8px rgba(25, 118, 210, 0.5);
}
</style>
