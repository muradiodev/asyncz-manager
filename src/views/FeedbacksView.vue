<template>
  <div class="container">
    <!-- breadcrumb -->
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link :to="{name: 'home'}">Home</router-link>
        </li>
        <li class="breadcrumb-item active" aria-current="page">
          Create Feedback
        </li>
      </ol>
    </nav>

    <div class="row">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h4 class="mb-0">Create New Feedback</h4>
          </div>
          <div class="card-body">
            <form @submit.prevent="createFeedback">
              <div class="row">
                <div class="col-md-12 mb-3">
                  <label for="title" class="form-label">Title</label>
                  <input
                    type="text"
                    class="form-control"
                    id="title"
                    v-model="feedbackData.title"
                    required
                    placeholder="Enter feedback title..."
                  />
                </div>

                <div class="col-md-12 mb-3">
                  <label for="description" class="form-label">Description</label>
                  <textarea
                    class="form-control"
                    id="description"
                    v-model="feedbackData.description"
                    rows="4"
                    placeholder="Enter your feedback description..."
                  ></textarea>
                </div>

                <div class="col-md-12 mb-3">
                  <label for="images" class="form-label">Images (PNG, JPG, JPEG)</label>
                  <input
                    type="file"
                    class="form-control"
                    id="images"
                    @change="handleImageUpload"
                    multiple
                    accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                  />
                  <small class="form-text text-muted">You can select multiple images (PNG, JPG, JPEG only, max 5MB each)</small>

                  <!-- Preview selected images -->
                  <div v-if="selectedImages.length > 0" class="mt-3">
                    <label class="form-label">Selected Images:</label>
                    <div class="row">
                      <div v-for="(image, index) in selectedImages" :key="index" class="col-md-3 mb-2">
                        <div class="position-relative">
                          <img
                            :src="image.preview"
                            :alt="`Selected image ${index + 1}`"
                            class="img-fluid rounded shadow-sm"
                            style="max-height: 150px; object-fit: cover; width: 100%;"
                          >
                          <button
                            type="button"
                            class="btn btn-danger btn-sm position-absolute"
                            @click="removeImage(index)"
                            style="top: 5px; right: 5px;"
                          >
                            ×
                          </button>
                        </div>
                        <small class="text-muted d-block mt-1">{{ image.file.name }}</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-md-12">
                  <button
                    class="btn-success-custom"
                    type="submit"
                    :disabled="isSubmitting"
                  >
                    <span v-if="isSubmitting">
                      <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                      Creating...
                    </span>
                    <span v-else>Create Feedback</span>
                  </button>

                  <button
                    class="btn-outline-custom ms-2"
                    type="button"
                    @click="resetForm"
                    :disabled="isSubmitting"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Optional: Show recent feedbacks or instructions -->
      <div class="col-md-4">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Guidelines</h5>
          </div>
          <div class="card-body">
            <ul class="list-unstyled">
              <li class="mb-2">
                <i class="fas fa-check text-success me-2"></i>
                Provide a clear and descriptive title
              </li>
              <li class="mb-2">
                <i class="fas fa-check text-success me-2"></i>
                Include detailed description of your feedback
              </li>
              <li class="mb-2">
                <i class="fas fa-check text-success me-2"></i>
                Add relevant images if applicable
              </li>
              <li class="mb-2">
                <i class="fas fa-info text-info me-2"></i>
                Supported formats: PNG, JPG, JPEG
              </li>
              <li class="mb-2">
                <i class="fas fa-info text-info me-2"></i>
                Maximum file size: 5MB per image
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth.js'
import { mapState } from 'pinia'
import { sendFeedback } from '@/repositories/FeedbackRepository.js'
import { uploadMultipleImages } from '@/repositories/UploadRepository.js'

export default {
  name: 'FeedbacksView',
  data() {
    return {
      feedbackData: {
        title: '',
        description: ''
      },
      selectedImages: [],
      isSubmitting: false
    }
  },
  computed: {
    ...mapState(useAuthStore, ['token', 'user'])
  },
  methods: {
    handleImageUpload(event) {
      const files = Array.from(event.target.files)

      files.forEach(file => {
        if (this.isValidImageFile(file)) {
          const reader = new FileReader()
          reader.onload = (e) => {
            this.selectedImages.push({
              file: file,
              preview: e.target.result
            })
          }
          reader.readAsDataURL(file)
        }
      })

      // Clear the input so the same file can be selected again if needed
      event.target.value = ''
    },

    isValidImageFile(file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg']
      const maxSize = 5 * 1024 * 1024 // 5MB

      if (!validTypes.includes(file.type)) {
        this.$swal({
          title: 'Invalid File Type',
          text: 'Please select only PNG, JPG, or JPEG files.',
          icon: 'error'
        })
        return false
      }

      if (file.size > maxSize) {
        this.$swal({
          title: 'File Too Large',
          text: 'Please select files smaller than 5MB.',
          icon: 'error'
        })
        return false
      }

      return true
    },

    removeImage(index) {
      this.selectedImages.splice(index, 1)
    },

    async createFeedback() {
      if (!this.feedbackData.title.trim()) {
        this.$swal({
          title: 'Validation Error',
          text: 'Please enter a title for your feedback.',
          icon: 'error'
        })
        return
      }

      this.isSubmitting = true

      try {
        let imagePaths = []

        // Step 1: Upload images first if there are any
        if (this.selectedImages.length > 0) {
          const imageFiles = this.selectedImages.map(img => img.file)

          const uploadResults = await uploadMultipleImages(this.token, imageFiles)

          // Filter successful uploads and extract paths
          const successfulUploads = uploadResults.filter(result => result.code === 200)
          imagePaths = successfulUploads.map(result => result.path)

          // Check if all images were uploaded successfully
          if (successfulUploads.length !== imageFiles.length) {
            const failedCount = imageFiles.length - successfulUploads.length

            const result = await this.$swal({
              title: 'Upload Warning',
              text: `${failedCount} image(s) failed to upload. Continue with ${successfulUploads.length} successful uploads?`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Continue',
              cancelButtonText: 'Cancel'
            })

            if (!result.isConfirmed) {
              this.isSubmitting = false
              return
            }
          }
        }

        // Step 2: Send feedback with uploaded image paths
        const response = await sendFeedback(
          this.token,
          this.feedbackData.title,
          this.feedbackData.description,
          imagePaths
        )

        if (response.code === 200) {
          this.$swal({
            title: 'Success!',
            text: 'Your feedback has been submitted successfully.',
            icon: 'success'
          }).then(() => {
            this.resetForm()
          })
        } else {
          throw new Error(response.message || 'Failed to submit feedback')
        }
      } catch (error) {
        this.$swal({
          title: 'Error',
          text: error.message || 'Failed to submit feedback. Please try again.',
          icon: 'error'
        })
      } finally {
        this.isSubmitting = false
      }
    },

    resetForm() {
      this.feedbackData = {
        title: '',
        description: ''
      }
      this.selectedImages = []
    }
  }
}
</script>

<style scoped>
.img-fluid {
  width: 100%;
  height: auto;
}

.position-relative {
  position: relative;
}

.position-absolute {
  position: absolute;
}

.btn-success-custom:disabled,
.btn-outline-custom:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}
</style>
