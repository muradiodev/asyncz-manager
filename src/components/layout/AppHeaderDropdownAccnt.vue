<script>
import avatar from '@/assets/images/avatar.jpg'
export default {
  data() {
    return { avatar }
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
    }
  }
}
</script>

<template>
  <div class="relative" @mouseleave="open = false" v-slot="{ open }">
    <button @mouseover="open = true" class="flex items-center focus:outline-none">
      <img :src="avatar" alt="avatar" class="h-8 w-8 rounded-full" />
    </button>
    <div v-if="open" class="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
      <div class="px-4 py-2 text-gray-500 font-semibold border-b">Account</div>
      <button @click="$router.push({name:'profile'})" class="block w-full text-left px-4 py-2 hover:bg-gray-100">Profile</button>
      <button @click="logout" class="block w-full text-left px-4 py-2 hover:bg-gray-100">Logout</button>
    </div>
  </div>
</template>
