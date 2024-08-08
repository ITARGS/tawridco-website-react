import axios from "axios";
import store from "../model/store"

const access_key_param = 'x-access-key';
const access_key = "903361";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_UR
})

const getStoredToken = async () => {
    const state = store.getState()
    return state?.user?.jwtToken
}

api.interceptors.request.use(
    async (config) => {
        try {
            const authToken = await getStoredToken()
            if (token) {
                config.headers.Authorization = authToken
            }
            config.headers["Content-Type"] = "multipart/form-data"
            config.headers['x-access-key'] = access_key
            return config
        } catch (error) {
            console.error("Error in token retrival", error)
            return Promise.reject(error)
        }
    },
    (error) => {
        console.error("Error in inceptor", error)
        return Promise.reject(error)
    }
)

api.interceptors.response.use(
    (response) => {
        try {
            return response
        } catch (error) {
            console.error("Error while fetching data", error)
            return Promise.reject(error)
        }
    },
    (error) => {
        console.error("Error while fetching data", error)
        return Promise.reject(error)
    }
)

export default api;