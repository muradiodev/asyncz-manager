import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBUKQUp3kGvghOZU8dAtbmIO1pNoc5P8Z4",
  authDomain: "asyncz-1.firebaseapp.com",
  projectId: "asyncz-1",
  storageBucket: "asyncz-1.firebasestorage.app",
  messagingSenderId: "297420937945",
  appId: "1:297420937945:web:00e6680d0df063fb757cc8"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Auth
export const auth = getAuth(app)

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('email')
googleProvider.addScope('profile')

export default app
