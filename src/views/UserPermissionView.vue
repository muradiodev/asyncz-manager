<template>
  <div v-if="companyUser">
    <h3>
      {{ $t('userPermission.title') }}
      <span class="text-primary">{{ companyUser.name }}</span>
      <code>[{{ companyUser.role }}]</code>
    </h3>

    <div class="alert alert-warning" v-if="user.id === companyUser.id">
      {{ $t('userPermission.loggedInWarning') }}
    </div>

    <div v-if="!editing">
      <p class="lead fw-bold"></p>

      <div v-for="p in companyUser.permissions" :key="p">
        <fa-icon icon="check-square" class="text-success" />
        {{ p }}
      </div>

      <div class="alert alert-warning" v-if="companyUser.permissions.length < 1">
        {{ $t('userPermission.noPermissions') }}
      </div>

      <button class="btn-outline-custom" @click.prevent="editing = true">
        {{ $t('userPermission.actions.edit') }}
      </button>
    </div>

    <div v-else>
      <p>{{ $t('userPermission.permissionListTitle') }}</p>

      <div>
        <div class="form-check form-switch" v-for="p in permissions" :key="p">
          <input
            class="form-check-input"
            :value="p"
            type="checkbox"
            v-model="companyUser.permissions"
            role="switch"
            :id="`permission_${p}`"
            @change="permissionChanged(p, $event)"
          />
          <label class="form-check-label" :for="`permission_${p}`">{{ p }}</label>
        </div>
      </div>
    </div>
  </div>

  <div v-else>
    <p class="alert alert-info">{{ $t('userPermission.loading') }}</p>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth.js'
import { mapState } from 'pinia'
import {
  addPermission,
  getUser,
  getUserPermissions,
  removePermission
} from '@/repositories/CompanyUserRepository.js'
import { toast } from 'vue3-toastify'
import { customAlert } from '@/utils/utils.js'
import { FontAwesomeIcon as FaIcon } from '@fortawesome/vue-fontawesome'

export default {
  name: 'UserPermissionView',
  components: { FaIcon },
  props: {
    userId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      companyUser: null,
      permissions: [],
      editing: false
    }
  },
  watch: {
    userId() {
      this.getUser()
    },
    editing() {
      this.getUser()
    }
  },
  computed: {
    ...mapState(useAuthStore, ['token', 'user', 'permissions'])
  },
  methods: {
    getUser() {
      getUser(this.token, this.userId).then(response => {
        if (response.code === 200) {
          this.companyUser = response.user

          getUserPermissions(this.token, this.companyUser.role).then(permissions => {
            this.permissions = permissions
          })
        } else {
          toast.error(response.message)
        }
      })
    },

    permissionChanged(permission, $event) {
      if ($event.target.checked) {
        addPermission(this.token, this.userId, permission).then(res => {
          if (res.code === 200) {
            toast(this, 'success', this.$t('userPermission.toast.permissionAdded'))
          } else {
            customAlert(
              `${this.$t('general.error')} ${res.code}`,
              res.message,
              'error'
            )
          }
          this.$emit('updated')
        })
      } else {
        removePermission(this.token, this.userId, permission).then(res => {
          if (res.code === 200) {
            toast(this, 'success', this.$t('userPermission.toast.permissionRemoved'))
          } else {
            customAlert(
              `${this.$t('general.error')} ${res.code}`,
              res.message,
              'error'
            )
          }
          this.$emit('updated')
        })
      }
    }
  },
  mounted() {
    this.getUser()
  }
}
</script>