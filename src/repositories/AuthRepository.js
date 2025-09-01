import Repository, { baseUrl } from './Repository'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth, googleProvider } from '@/firebase/config'

// Firebase Auth State Management
let currentFirebaseUser = null
let authInitialized = false

onAuthStateChanged(auth, (user) => {
  currentFirebaseUser = user
  authInitialized = true

  if (user) {
    // Store Firebase token
    user.getIdToken().then(token => {
      localStorage.setItem('firebase_token', token)
    })
  } else {
    localStorage.removeItem('firebase_token')
  }
})

// Existing backend auth functions
export async function registerStart(companyName, companyEmail, adminName, adminEmail) {
  return await Repository.postForm(`${baseUrl}/manager/register/start`, {
    companyName: companyName,
    companyEmail: companyEmail,
    adminName: adminName,
    adminEmail: adminEmail
  })
    .then((response) => {
      if (response.data) {
        return response.data
      } else {
        return { code: 500, message: 'Internal Server Error' }
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      return { code: 501, message: error }
    })
}

export async function registerVerify(companyName, companyEmail, adminName, adminEmail, otp) {
  return await Repository.postForm(`${baseUrl}/manager/register/verify`, {
    companyName: companyName,
    companyEmail: companyEmail,
    adminName: adminName,
    adminEmail: adminEmail,
    otp: otp
  })
    .then((response) => {
      if (response.data) {
        return response.data
      } else {
        return { code: 500, message: 'Internal Server Error' }
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      return { code: 501, message: error }
    })
}

export async function login(email, password) {
  return await Repository.postForm(`${baseUrl}/manager/login`, {
    email: email,
    password: password
  })
    .then((response) => {
      if (response.data) {
        return response.data
      } else {
        return { code: 500, message: 'Internal Server Error' }
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      return { code: 501, message: error }
    })
}

// NEW: Firebase Google Login
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const idToken = await result.user.getIdToken()

    // Use Repository.post with baseUrl like your other API calls
    const response = await Repository.post(`${baseUrl}/manager/google-login`, {
      idToken: idToken
    })

    if (response.data && response.data.code === 200) {
      return {
        code: response.data.code,
        message: response.data.message,
        data: response.data.data,
        token: response.data.token,
        firebaseUser: {
          name: result.user.displayName,
          email: result.user.email
        }
      }
    } else {
      throw new Error(response.data?.message || 'Login failed')
    }

  } catch (error) {
    console.error('Google login error:', error)
    return {
      code: 500,
      message: error.message || 'Google login failed',
      data: null
    }
  }
}

// NEW: Firebase Logout
export async function firebaseLogout() {
  try {
    await signOut(auth)
    localStorage.removeItem('firebase_token')
    return { code: 200, message: 'Logged out successfully' }
  } catch (error) {
    console.error('Firebase logout error:', error)
    return { code: 500, message: 'Logout failed' }
  }
}

// NEW: Get Firebase User
export function getCurrentFirebaseUser() {
  return currentFirebaseUser
}

// NEW: Get Firebase Token
export async function getFirebaseToken() {
  if (currentFirebaseUser) {
    return await currentFirebaseUser.getIdToken()
  }
  return null
}

// NEW: Check if Firebase Auth is ready
export function isFirebaseAuthReady() {
  return authInitialized
}

// Existing backend functions
export async function getAccount(token) {
  return await Repository.get(`${baseUrl}/manager/me?token=${token}`)
    .then((response) => {
      if (response.data) {
        return response.data
      } else {
        return { code: 500, message: 'Internal Server Error' }
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      return { code: 501, message: error }
    })
}

export async function saveAccount(token, name, about) {
  return await Repository.postForm(`${baseUrl}/manager/profile?token=${token}`, {
    name,
    about
  })
    .then((response) => {
      if (response.data) {
        return response.data
      } else {
        return { code: 500, message: 'Internal Server Error' }
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      return { code: 501, message: error }
    })
}

export async function setPassword(token, password) {
  return await Repository.postForm(`${baseUrl}/manager/password?token=${token}`, {
    password
  })
    .then((response) => {
      if (response.data) {
        return response.data
      } else {
        return { code: 500, message: 'Internal Server Error' }
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      return { code: 501, message: error }
    })
}

export async function setNewPassword(token, password, currentPassword) {
  return await Repository.postForm(`${baseUrl}/manager/new-password?token=${token}`, {
    password,
    currentPassword
  })
    .then((response) => {
      if (response.data) {
        return response.data
      } else {
        return { code: 500, message: 'Internal Server Error' }
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      return { code: 501, message: error }
    })
}
