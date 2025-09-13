import { jwtDecode } from 'jwt-decode'

const decodedData = async() => {
    const data = localStorage.getItem('accessToken')
    if(data) {
        jwtDecode(data)
        return data
    }
}

export default decodedData