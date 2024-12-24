import Repository, { baseUrl } from './Repository'


export async function getExperts(token) {
  return await Repository.get(`${baseUrl}/manager/experts?token=${token}`)
    .then((response) => {
      if (response.data && response.data.code === 200) {
        return response.data.experts
      } else {
        return []
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      return []
    })
}

export async function getExpert(token, id) {
  return await Repository.get(`${baseUrl}/manager/expert/${id}?token=${token}`)
    .then((response) => {
      if (response.data) {
        return response.data
      } else {
        return { code: 500, message: 'Internal Server Error' }
      }
    })
    .catch((error) => {
      return { code: 501, message: error }
    })
}

export async function createExpert(token,branch, name, email, password) {
  return await Repository.postForm(`${baseUrl}/manager/expert?token=${token}`, {
    branch,
    name,
    email,
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
      return { code: 501, message: error }
    })
}

export async function saveExpert(token, id, branch, name, about, email, color, status) {
  return await Repository.postForm(`${baseUrl}/manager/expert/${id}?token=${token}`, {
    name,
    about,
    email,
    color,
    status,
    branch
  })
    .then((response) => {
      if (response.data) {
        return response.data
      } else {
        return { code: 500, message: 'Internal Server Error' }
      }
    })
    .catch((error) => {
      return { code: 501, message: error }
    })
}


export async function getExpertProcedures(token, id) {
  return await Repository.get(`${baseUrl}/manager/expertProcedures?token=${token}&expert=${id}`)
    .then((response) => {
      if (response.data && response.data.code === 200) {
        return response.data.procedures
      } else {
        return []
      }
    })
    .catch(() => {
      return []
    })
}


export async function addExpertProcedure(token, expertId, procedureId) {
  return await Repository.postForm(`${baseUrl}/manager/expertProcedure?token=${token}`, {
    expert: expertId,
    procedure: procedureId
  })
    .then((response) => {
      if (response.data) {
        return response.data
      } else {
        return { code: 500, message: 'Internal Server Error' }
      }
    })
    .catch((error) => {
      return { code: 501, message: error }
    })
}


export async function removeExpertProcedure(token, expertProcedureId) {
  return await Repository.postForm(`${baseUrl}/manager/expertProcedure/${expertProcedureId}/delete?token=${token}`, {})
    .then((response) => {
      if (response.data) {
        return response.data
      } else {
        return { code: 500, message: 'Internal Server Error' }
      }
    })
    .catch((error) => {
      return { code: 501, message: error }
    })
}



export async function getExpertSchedules(token, id) {
  return await Repository.get(`${baseUrl}/manager/schedules?token=${token}&expert=${id}`)
    .then((response) => {
      if (response.data && response.data.code === 200) {
        return response.data.schedules
      } else {
        return []
      }
    })
    .catch(() => {
      return []
    })
}


export async function updateExpertSchedule(token, expertId, data) {
  return await Repository.postForm(`${baseUrl}/manager/schedule?token=${token}`, {
    expert: expertId,
    dayData: data
  })
    .then((response) => {
      if (response.data) {
        return response.data
      } else {
        return { code: 500, message: 'Internal Server Error' }
      }
    })
    .catch((error) => {
      return { code: 501, message: error }
    })
}
