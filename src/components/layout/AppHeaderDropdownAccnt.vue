<script>
import avatar from '@/assets/images/avatar.jpg'
import { cilAccountLogout , cilUser, cilDollar, cilShieldAlt, cilSettings, cilGlobeAlt} from '@coreui/icons'
import { customAsk } from '@/utils/utils.js'

export default {
  data() {
    return {
      avatar: avatar,
      cilAccountLogout: cilAccountLogout,
      cilUser: cilUser,
      cilDollar: cilDollar,
      cilShieldAlt: cilShieldAlt,
      cilSettings: cilSettings,
      cilGlobeAlt: cilGlobeAlt
    }
  },

  methods: {
    logout() {
      customAsk(
        'Logout',
        'Are you sure you want to logout?',
        'warning',
        () =>{
          localStorage.removeItem('token')
          window.location.reload()
        },
        () =>{

        }
      )
    },
  },
}
</script>

<template>
  <CDropdown placement="bottom-end" variant="nav-item">
    <CDropdownToggle
      class="btn btn-outline-success border-0 p-0 avatar-toggle"
      :caret="false"
      style="transition: border-color .15s;"
    >
      <CAvatar :src="avatar" :size="32" shape="rounded-circle" />
    </CDropdownToggle>

    <CDropdownMenu class="pt-2 pb-2">
      <CDropdownItem @click="$router.push({name:'account'})" class="d-flex align-items-center py-2">
        <CIcon :icon="cilUser" class="me-2" />
        Account
      </CDropdownItem>

      <CDropdownItem @click="$router.push({name:'billing'})" class="d-flex align-items-center py-2">
        <CIcon :icon="cilDollar" class="me-2" />
        Billing
      </CDropdownItem>

      <CDropdownItem @click="$router.push({name:'permissions'})" class="d-flex align-items-center py-2">
        <CIcon :icon="cilShieldAlt" class="me-2" />
        Permissions
      </CDropdownItem>

      <CDropdownItem @click="$router.push({name:'business-settings'})" class="d-flex align-items-center py-2">
        <CIcon :icon="cilSettings" class="me-2" />
        Business Settings
      </CDropdownItem>

      <CDropdownItem @click="$router.push({name:'language'})" class="d-flex align-items-center justify-content-between py-2">
        <div class="d-flex align-items-center">
          <CIcon :icon="cilGlobeAlt" class="me-2" />
          Language
        </div>
        <CIcon icon="cil-chevron-right" />
      </CDropdownItem>
      <CDropdownDivider />

      <CDropdownItem @click="logout" class="d-flex align-items-center py-2">
        <CIcon :icon="cilAccountLogout" class="me-2" />
        Log out
      </CDropdownItem>
    </CDropdownMenu>
  </CDropdown>
</template>
<style scoped>
.c-dropdown-item, .dropdown-item, .c-dropdown-item:hover {
  cursor: pointer !important;
}

.c-dropdown-item:hover, .dropdown-item:hover {
  background-color: #f3f4f6 !important; /* daha yaxşı hover effekti üçün */
}
.avatar-toggle {
  border-radius: 50% !important;
  padding: 0 !important;
  width: 40px; /* avatar ölçüsünə uyğunlaşdır */
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-toggle:hover, .avatar-toggle:focus-visible {
  background-color: #e8faf3 !important;   /* istəyə görə rəng seç */
  border-color: #198754 !important;       /* outline-success üçün */
  border-radius: 50% !important;
  box-shadow: 0 0 0 2px rgba(25,135,84,0.1);
  transition: background .15s, border-color .15s;
}
</style>
