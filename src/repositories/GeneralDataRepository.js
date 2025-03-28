import Repository, {baseUrl} from './Repository'

export async function getCalendarInfo(token, startDate, endDate) {
    return await Repository.get(`${baseUrl}/manager/appointmentCalendar?start=${startDate}&end=${endDate}&token=${token}`)
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

export async function getSmallCalendar(token, date) {
    return await Repository.get(`${baseUrl}/manager/smallCalendar?date=${date}&token=${token}`)
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

export async function getSchedules(token) {
    return await Repository.get(`${baseUrl}/manager/getSchedules?token=${token}`)
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

