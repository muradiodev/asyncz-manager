import Repository, { baseUrl } from './Repository'

export async function getShareLinks(token) {
  return await Repository.get(`${baseUrl}/manager/share?token=${token}`)
    .then((response) => {
      if (response.data && response.data.code === 200) {
        return response.data.share_list
      } else {
        return []
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      return []
    })
}