import Repository, {baseUrl} from './Repository'

export async function login(email, password) {
    return await Repository.postForm(`${baseUrl}/manager/login`, {
        email: email,
        password: password
    })
        .then((response) => {
            if (response.data) {
                return response.data
            } else {
                return {code: 500, message: 'Internal Server Error'}
            }
        })
        .catch((error) => {
            console.log(JSON.stringify(error))
            return {code: 501, message: error}
        })
}

export async function getProfile(token) {
    return await Repository.get(`${baseUrl}/manager/me?token=${token}`)
        .then((response) => {
            if (response.data) {
                return response.data
            } else {
                return {code: 500, message: 'Internal Server Error'}
            }
        })
        .catch((error) => {
            console.log(JSON.stringify(error))
            return {code: 501, message: error}
        })
}

export async function saveProfile(token,name, about) {


    return await Repository.postForm(`${baseUrl}/manager/profile?token=${token}`,{
      name,
      about
    })
        .then((response) => {
            if (response.data) {
                return response.data
            } else {
                return {code: 500, message: 'Internal Server Error'}
            }
        })
        .catch((error) => {
            console.log(JSON.stringify(error))
            return {code: 501, message: error}
        })
}

export async function setPassword(token,password) {


    return await Repository.postForm(`${baseUrl}/manager/password?token=${token}`,{
      password
    })
        .then((response) => {
            if (response.data) {
                return response.data
            } else {
                return {code: 500, message: 'Internal Server Error'}
            }
        })
        .catch((error) => {
            console.log(JSON.stringify(error))
            return {code: 501, message: error}
        })
}
