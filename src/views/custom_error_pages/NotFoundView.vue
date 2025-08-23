<template>
  <div class="error-container">
    <div class="error-content">

      <h1 class="error-code">404</h1>
      <h2 class="error-title">Page Not Found</h2>
      <p class="error-description">
        The page you're looking for doesn't exist or has been moved to another location.
      </p>

      <div class="error-actions">
        <router-link to="/dashboard/home" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="currentColor"/>
          </svg>
          Go to Home
        </router-link>
      </div>

      <div class="help-links">
        <h3>Need help?</h3>
        <ul>
          <li><router-link to="/dashboard/home">Home</router-link></li>
          <li><router-link to="/dashboard/account">Account Settings</router-link></li>
          <li><router-link to="/dashboard/calendar">Calendar</router-link></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.error-content {
  background: white;
  border-radius: 16px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 500px;
  width: 100%;
}

.error-icon {
  margin-bottom: 2rem;
  opacity: 0.7;
}

.error-code {
  font-size: 6rem;
  font-weight: 800;
  color: #374151;
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
  background: #3B82F6;
  color: white;
}

.btn-primary:hover {
  background: #2563EB;
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

.help-links {
  border-top: 1px solid #E5E7EB;
  padding-top: 2rem;
  margin-top: 2rem;
}

.help-links h3 {
  color: #374151;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.help-links ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.help-links a {
  color: #3B82F6;
  text-decoration: none;
  font-weight: 500;
}

.help-links a:hover {
  color: #2563EB;
  text-decoration: underline;
}

@media (max-width: 640px) {
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

  .help-links ul {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
