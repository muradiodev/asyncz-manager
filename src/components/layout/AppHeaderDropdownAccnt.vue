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
    <CDropdownMenu class="pt-0">
      <CDropdownHeader
        component="h6"
        class="bg-body-secondary text-body-secondary fw-semibold mb-2 rounded-top"
      >
        Account
      </CDropdownHeader>
      <CDropdownItem @click="$router.push({name:'profile'})" class="clickable-item">
        <CIcon icon="cil-user" />
        Profile
      </CDropdownItem>

      <CDropdownItem @click="logout" class="clickable-item">
        <CIcon icon="cil-lock-locked" />
        Logout
      </CDropdownItem>
    </CDropdownMenu>
  </CDropdown>
</template>

<style scoped>
</style>
