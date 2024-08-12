// A File for new updated version data fetching using axios
import api from "./apiMiddleware";
import store from "../model/store";
import * as apiEndPoints from "./apiEndPointCollection"

export const registerUser = async ({ Uid, name, email, mobile, type, fcm, country_code }) => {
    const formData = new FormData();
    let formdata = new FormData();
    formdata.append("auth_uid", Uid);
    formdata.append("name", name);
    formdata.append("email", email)
    formdata.append("country_code", country_code)
    formdata.append("mobile", mobile)
    formdata.append("type", type)
    formdata.append("fcm_token", fcm);
    formdata.append("platform", "web");
    const response = await api.post(apiEndPoints.register, formData)
    return response.data
}
export const login = async ({ Uid, fcm }) => {
    const formData = new FormData();
    formData.append("auth_uid", Uid);
    formData.append("fcm_token", fcm);
    formData.append("platform", "web");
    const response = await api.post(apiEndPoints.login, formData)
    return response.data
}
export const logout = async () => {
    const response = await api.post(apiEndPoints.logout)
    return response.data
}
export const deleteAccount = async ({ Uid }) => {
    const formData = new FormData();
    formData.append("auth_uid", Uid);
    const response = await api.post(apiEndPoints.deleteAccount, formData)
    return response.data
}
export const getSetting = async () => {
    const params = {
        is_web_setting: 1
    }
    const response = await api.get(apiEndPoints.getSettings, { params })
    return response.data
}
export const getCity = async ({ latitude, longitude }) => {
    var params = {
        latitude: latitude,
        longitude: longitude,
    };
    const response = await api.get(apiEndPoints.getCity, { params })
    return response.data
}
export const getShop = async ({ latitude, longitude }) => {
    var params = { latitude: latitude, longitude: longitude };
    const response = api.get(apiEndPoints.getShop, { params })
    return response.data
}
export const getBrands = async () => {
    const response = await api.get(apiEndPoints.getBrands)
    return response.data
}
export const getCategory = async ({ id = "", limit = "", offset = "", slug = "" }) => {
    const params = { category_id: id, limit: limit, offset: offset, slug: slug }
    const response = await api.get(apiEndPoints.getCategory, { params })
    return response.data
}
export const getSlider = async () => {
    const response = await api.get(apiEndPoints.getSlider)
    return response.data
}
export const getOffer = async () => {
    const response = await api.get(apiEndPoints.getOffer)
    return response.data
}
export const getSection = async ({ city_id, latitiude, longitude }) => {
    var params = { city_id: city_id, latitude: latitiude, longitude: longitude };
    const response = await api.get(apiEndPoints.getSection, { params })
    return response.data
}
export const getUser = async () => {
    const response = await api.get(apiEndPoints.getUser)
    return response.data
}
export const editProfile = async ({ uname, email, selectedFile = "" }) => {
    const formData = new FormData();
    formData.append("name", uname);
    formData.append("email", email);
    if (selectedFile !== null) {
        formData.append("profile", selectedFile);
    }
    const response = await api.post(apiEndPoints.editProfile, formData)
    return response.data
}