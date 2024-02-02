import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => {
    return {
      token: null,
      user: null,
      company: null
    }
  },

  actions: {
    setToken(newToken) {
      this.token = newToken
    },
    setUser(newUser) {
      this.user = newUser
    },
    setCompany(newCompany) {
      this.company = newCompany
    }
  }
})
