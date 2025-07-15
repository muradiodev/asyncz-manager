<script>
import avatar from '@/assets/images/avatar.jpg'

export default {
  data() {
    return {
      avatar: avatar,
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
  },
}
</script>

<template>
  <CDropdown placement="bottom-end" variant="nav-item">
    <CDropdownToggle class="py-0 pe-0" :caret="false">
      <CAvatar :src="avatar" size="md" shape="rounded-circle" />
    </CDropdownToggle>
    <CDropdownMenu class="pt-2 pb-2">
      <CDropdownItem @click="$router.push({name:'profile'})" class="d-flex align-items-center py-2">
        <CIcon icon="cil-user" class="me-2" />
        Profile
      </CDropdownItem>

      <CDropdownItem @click="$router.push({name:'billing'})" class="d-flex align-items-center py-2">
        <CIcon icon="cil-credit-card" class="me-2" />
        Billing
      </CDropdownItem>

      <CDropdownItem @click="$router.push({name:'permissions'})" class="d-flex align-items-center py-2">
        <CIcon icon="cil-shield-alt" class="me-2" />
        Permissions
      </CDropdownItem>

      <CDropdownItem @click="$router.push({name:'business-settings'})" class="d-flex align-items-center py-2">
        <CIcon icon="cil-settings" class="me-2" />
        Business Settings
      </CDropdownItem>

      <CDropdownItem @click="$router.push({name:'language'})" class="d-flex align-items-center justify-content-between py-2">
        <div class="d-flex align-items-center">
          <CIcon icon="cil-globe-alt" class="me-2" />
          Language
        </div>
        <CIcon icon="cil-chevron-right" />
      </CDropdownItem>

      <CDropdownItem @click="logout" class="d-flex align-items-center py-2">
        <CIcon icon="cil-account-logout" class="me-2" />
        Log out
      </CDropdownItem>
    </CDropdownMenu>
  </CDropdown>
</template>
