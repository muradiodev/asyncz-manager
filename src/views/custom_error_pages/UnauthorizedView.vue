<template>
  <div class="error-container">
    <div class="error-content">
      <div class="error-icon">
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="#EF4444"/>
        </svg>
      </div>

      <h1 class="error-code">401</h1>
      <h2 class="error-title">Access Denied</h2>
      <p class="error-description">
        You don't have permission to access this resource. Please log in with appropriate credentials or contact your administrator.
      </p>

      <div class="error-actions">
        <button @click="goToLogin" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z" fill="currentColor"/>
          </svg>
          Login Again
        </button>

        <button @click="goBack" class="btn btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
          </svg>
          Go Back
        </button>
      </div>

      <div class="error-details">
        <div class="detail-card">
          <h3>Common Reasons:</h3>
          <ul>
            <li>Your session has expired</li>
            <li>Insufficient permissions for this resource</li>
            <li>Account has been suspended or deactivated</li>
            <li>Invalid authentication token</li>
          </ul>
        </div>

        <div class="detail-card">
          <h3>What you can do:</h3>
          <ul>
            <li>Try logging in again</li>
            <li>Clear your browser cache and cookies</li>
            <li>Contact your system administrator</li>
            <li>Check if your account is active</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

const goToLogin = () => {
  // Clear any existing auth data
  authStore.logout()
  localStorage.removeItem('token')

  // Redirect to login with current path as back parameter
  router.push({
    name: 'login',
    query: { back: router.currentRoute.value.fullPath }
  })
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/dashboard')
  }
}
</script>

<style scoped>
.error-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  padding: 2rem;
}

.error-content {
  background: white;
  border-radius: 16px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 600px;
  width: 100%;
}

.error-icon {
  margin-bottom: 2rem;
}

.error-code {
  font-size: 6rem;
  font-weight: 800;
  color: #EF4444;
  margin: 0;
  line-height: 1;
}

.error-title {
  font-size: 2rem;
  font-weight: 600;
  color: #374151;
  margin: 1rem 0;
}

.error-description {
  color: #6B7280;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #EF4444;
  color: white;
}

.btn-primary:hover {
  background: #DC2626;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #F3F4F6;
  color: #374151;
  border: 1px solid #D1D5DB;
}

.btn-secondary:hover {
  background: #E5E7EB;
  transform: translateY(-1px);
}

.error-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
  border-top: 1px solid #E5E7EB;
  padding-top: 2rem;
}

.detail-card {
  text-align: left;
}

.detail-card h3 {
  color: #374151;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.detail-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.detail-card li {
  color: #6B7280;
  padding: 0.5rem 0;
  border-bottom: 1px solid #F3F4F6;
  position: relative;
  padding-left: 1.5rem;
}

.detail-card li:before {
  content: "•";
  color: #EF4444;
  font-weight: bold;
  position: absolute;
  left: 0;
}

.detail-card li:last-child {
  border-bottom: none;
}

@media (max-width: 768px) {
  .error-content {
    padding: 2rem;
  }

  .error-code {
    font-size: 4rem;
  }

  .error-title {
    font-size: 1.5rem;
  }

  .error-actions {
    flex-direction: column;
  }

  .error-details {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
