import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  const getPreferred = () => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme')
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }

  const theme = ref(getPreferred())

  const applyTheme = (val) => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', val === 'dark')
    }
  }

  const toggleTheme = (_theme) => {
    theme.value = _theme
  }

  const init = () => {
    applyTheme(theme.value)
  }

  watch(theme, (val) => {
    localStorage.setItem('theme', val)
    applyTheme(val)
  })

  return { theme, toggleTheme, init }
})
