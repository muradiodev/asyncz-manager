<script >
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
      <CAvatar :src="avatar" size="md" />
    </CDropdownToggle>
    <CDropdownMenu class="pt-0">
      <CDropdownHeader
        component="h6"
        class="bg-body-secondary text-body-secondary fw-semibold mb-2 rounded-top"
      >
        Account
      </CDropdownHeader>
      <CDropdownItem>
        <router-link class="text-secondary" :to="{name:'profile'}"  style="text-decoration: none">
          <CIcon icon="cil-user" />
          Profile
        </router-link>
      </CDropdownItem>

      <CDropdownItem>
        <a href="#" class="text-secondary" @click.prevent="logout" style="text-decoration: none">
        <CIcon icon="cil-lock-locked" /> Logout
      </a>

      </CDropdownItem>
    </CDropdownMenu>
  </CDropdown>
</template>
