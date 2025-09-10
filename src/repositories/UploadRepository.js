import Repository, { baseURL } from './Repository'

export async function uploadImage(token, imageFile) {
  const formData = new FormData()
  formData.append('token', token)
  formData.append('photo', imageFile)

  return await Repository.post(`${baseURL}/manager/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
    .then((response) => {
      if (response.data && response.data.code === 200) {
        return response.data
      } else {
        return {
          code: response.data?.code || 500,
          message: response.data?.message || 'Upload failed'
        }
      }
    })
    .catch((error) => {
      console.log('Upload error:', JSON.stringify(error))
      return {
        code: 500,
        message: 'Network error occurred'
      }
    })
}

// If you need to upload multiple images at once
export async function uploadMultipleImages(token, imageFiles) {
  const uploadPromises = imageFiles.map(file => uploadImage(token, file))

  try {
    const results = await Promise.all(uploadPromises)
    return results
  } catch (error) {
    console.log('Multiple upload error:', JSON.stringify(error))
    return []
  }
}

