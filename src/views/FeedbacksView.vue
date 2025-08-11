<template>
  <div class="container">
    <!-- breadcrumb -->
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link :to="{ name: 'home' }">{{ $t('navigation.home') }}</router-link>
        </li>
        <li class="breadcrumb-item active" aria-current="page">
          {{ $t('feedbacks.breadcrumb.create') }}
        </li>
      </ol>
    </nav>

    <div class="row">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h4 class="mb-0">{{ $t('feedbacks.title') }}</h4>
          </div>
          <div class="card-body">
            <form @submit.prevent="createFeedback">
              <div class="row">
                <div class="col-md-12 mb-3">
                  <label for="title" class="form-label">{{ $t('feedbacks.form.labels.title') }}</label>
                  <input
                    type="text"
                    class="form-control"
                    id="title"
                    v-model="feedbackData.title"
                    required
                    :placeholder="$t('feedbacks.form.placeholders.title')"
                  />
                </div>

                <div class="col-md-12 mb-3">
                  <label for="description" class="form-label">{{ $t('feedbacks.form.labels.description') }}</label>
                  <textarea
                    class="form-control"
                    id="description"
                    v-model="feedbackData.description"
                    rows="4"
                    :placeholder="$t('feedbacks.form.placeholders.description')"
                  ></textarea>
                </div>

                <div class="col-md-12 mb-3">
                  <label for="images" class="form-label">{{ $t('feedbacks.form.labels.images') }}</label>
                  <input
                    type="file"
                    class="form-control"
                    id="images"
                    @change="handleImageUpload"
                    multiple
                    accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                  />
                  <small class="form-text text-muted">{{ $t('feedbacks.form.help.images') }}</small>

                  <!-- Preview selected images -->
                  <div v-if="selectedImages.length > 0" class="mt-3">
                    <label class="form-label">{{ $t('feedbacks.form.labels.selectedImages') }}</label>
                    <div class="row">
                      <div v-for="(image, index) in selectedImages" :key="index" class="col-md-3 mb-2">
                        <div class="position-relative">
                          <img
                            :src="image.preview"
                            :alt="$t('feedbacks.preview.alt', { index: index + 1 })"
                            class="img-fluid rounded shadow-sm"
                            style="max-height: 150px; object-fit: cover; width: 100%;"
                          >
                          <button
                            type="button"
                            class="btn btn-danger btn-sm position-absolute"
                            @click="removeImage(index)"
                            style="top: 5px; right: 5px;"
                            aria-label="Remove image"
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
                      {{ $t('feedbacks.actions.creating') }}
                    </span>
                    <span v-else>{{ $t('feedbacks.actions.create') }}</span>
                  </button>

                  <button
                    class="btn-outline-custom ms-2"
                    type="button"
                    @click="resetForm"
                    :disabled="isSubmitting"
                  >
                    {{ $t('feedbacks.actions.reset') }}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Side panel -->
      <div class="col-md-4">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">{{ $t('feedbacks.guidelines.title') }}</h5>
          </div>
          <div class="card-body">
            <ul class="list-unstyled">
              <li class="mb-2">
                <i class="fas fa-check text-success me-2"></i>
                {{ $t('feedbacks.guidelines.items.clearTitle') }}
              </li>
              <li class="mb-2">
                <i class="fas fa-check text-success me-2"></i>
                {{ $t('feedbacks.guidelines.items.detailedDescription') }}
              </li>
              <li class="mb-2">
                <i class="fas fa-check text-success me-2"></i>
                {{ $t('feedbacks.guidelines.items.addImages') }}
              </li>
              <li class="mb-2">
                <i class="fas fa-info text-info me-2"></i>
                {{ $t('feedbacks.guidelines.items.supportedFormats') }}
              </li>
              <li class="mb-2">
                <i class="fas fa-info text-info me-2"></i>
                {{ $t('feedbacks.guidelines.items.maxSize') }}
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
import { toast } from 'vue3-toastify'

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
        toast.error('Please select only PNG, JPG, or JPEG files.');
        return false
      }

      if (file.size > maxSize) {
        toast.error('Please select files smaller than 5MB.')
        return false
      }

      return true
    },

    removeImage(index) {
      this.selectedImages.splice(index, 1)
    },

    async createFeedback() {
      if (!this.feedbackData.title.trim()) {
        toast.error('Please enter a title for your feedback.');
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
          toast.success('Your feedback has been submitted successfully.');
          this.resetForm();
        } else {
          throw new Error(response.message || 'Failed to submit feedback')
        }
      } catch (error) {
        toast.error(error.message || 'Failed to submit feedback. Please try again.');
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
