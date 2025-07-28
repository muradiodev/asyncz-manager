import Repository, { baseUrl } from './Repository'

export async function sendFeedback(token, title, description, resources) {
  return await Repository.postForm(`${baseUrl}/manager/feedbacks`, {
    token,
    title: title,
    description: description,
    resources: JSON.stringify(resources) // Convert array to JSON string if needed
  })
    .then((response) => {
      if (response.data) {
        return response.data
      } else {
        return { code: response.data?.code || 500, message: response.data?.message || 'Unknown error' }
      }
    })
    .catch((error) => {
      console.log('Feedback error:', JSON.stringify(error))
      return { code: 1000, message: 'Network error' }
    })
}
