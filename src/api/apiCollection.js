// A File for new updated version data fetching using axios
import api from "./apiMiddleware";
import store from "../model/store";
import * as apiEndPoints from "./apiEndPointCollection"

export const registerUser = async ({ name, email, mobile, type, fcm, country_code }) => {
    const formData = new FormData();
    // formData.append("auth_uid", Uid);
    formData.append("name", name);
    formData.append("email", email)
    formData.append("country_code", country_code)
    formData.append("mobile", mobile)
    formData.append("type", type)
    formData.append("fcm_token", fcm);
    formData.append("platform", "web");
    const response = await api.post(apiEndPoints.register, formData)
    return response.data
}
export const login = async ({ id, fcm, type }) => {
    const formData = new FormData();
    formData.append("id", id);
    formData.append("fcm_token", fcm);
    formData.append("type", type);
    formData.append("platform", "web");
    const response = await api.post(apiEndPoints.login, formData)
    return response.data
}
export const sendSms = async ({ mobile }) => {
    const formData = new FormData();
    formData.append("phone", mobile);
    const response = await api.post(apiEndPoints.sendSms, formData);
    return response.data;
}
export const verifyOTP = async ({ mobile, otp, country_code }) => {
    const formData = new FormData();
    formData.append("phone", mobile)
    formData.append("otp", otp)
    formData.append("country_code", country_code)
    const response = await api.post(apiEndPoints.verifyContact, formData);
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
export const getBrands = async ({ limit, offset }) => {
    let params = {
        limit: limit,
        offset: offset
    };
    const response = await api.get(apiEndPoints.getBrands, { params })
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
export const productByFilter = async ({ latitude, longitude, filters = undefined, tag_names = "", slug = "" }) => {
    const formData = new FormData();
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    if (tag_names !== "") {
        formData.append("tag_names", tag_names)
    }
    if (slug !== "") {
        formData.append("slug", slug)
    }
    if (filters !== undefined) {
        for (const filter in filters) {
            if ((filters[filter] !== null && filters[filter] !== undefined && filters[filter] !== "") || filters[filter]?.length > 0) {
                formData.append(filter, filters[filter]);
            }
            if (filters[filter] === "sizes") {
                formData.append(filter, filters[filter]);
            }
        }
    }
    const response = await api.post(apiEndPoints.getProducts, formData)
    return response.data
}
export const productById = async ({ latitude, longitude, id = -1, slug = "" }) => {
    let formData = new FormData();
    if (id != -1) {
        formData.append("id", id)
    }
    formData.append("latitude", latitude)
    formData.append("longitude", longitude)
    if (slug != "") {
        formData.append("slug", slug)
    }
    const response = await api.post(apiEndPoints.getProductById, formData)
    return response.data
}
export const getCart = async ({ latitude, longitude, checkout = 0 }) => {
    const params = { latitude: latitude, longitude: longitude, is_checkout: checkout };
    const response = await api.get(apiEndPoints.getCart, { params })
    return response.data
}
export const getCartCount = async () => {
    const response = await api.get(`${apiEndPoints.getCart}/${apiEndPoints.getCartCount}`)
    console.log(response)
    return response.data
}
export const getCheckOut = async ({ latitude, longitude, checkout = 1 }) => {
    var params = { latitude: latitude, longitude: longitude, is_checkout: checkout };
    const response = await api.get(apiEndPoints.getCart, { params })
    return response.data;
}
export const removeCart = async ({ }) => {
    const formData = new FormData()
    formData.append("is_remove_all", 1);
    const response = await api.post(`${apiEndPoints.getCart}/${apiEndPoints.remove}`, formData)
    return response.data
}
export const addToCart = async ({ product_id, product_variant_id, qty }) => {
    const formData = new FormData();
    formData.append("product_id", product_id);
    formData.append("product_variant_id", product_variant_id);
    formData.append("qty", qty);
    const response = await api.post(`${apiEndPoints.getCart}/${apiEndPoints.add}`, formData)
    return response.data
}
export const removeFromCart = async ({ product_id, product_variant_id }) => {
    const formData = new FormData()
    formData.append("product_id", product_id);
    formData.append("product_variant_id", product_variant_id);
    formData.append("is_remove_all", 0);
    const response = await api.post(`${apiEndPoints.getCart}/${apiEndPoints.remove}`, formData)
    return response.data;
}
export const getFavorite = async ({ latitude, longitude }) => {
    const params = { latitude: latitude, longitude: longitude };
    const response = await api.get(apiEndPoints.getFavorite, { params })
    return response.data
}
export const addToFavorite = async ({ product_id }) => {
    const formData = new FormData()
    formData.append("product_id", product_id)
    const response = await api.post(`${apiEndPoints.getFavorite}/${apiEndPoints.add}`, formData)
    return response.data
}
export const removeFromFavorite = async ({ product_id }) => {
    const formData = new FormData()
    formData.append("product_id", product_id);
    const response = await api.post(`${apiEndPoints.getFavorite}/${apiEndPoints.remove}`, formData)
    return response.data;
}
export const getAddress = async ({ }) => {
    const response = await api.get(apiEndPoints.getAddress)
    return response.data
}
export const addAddress = async ({ name, mobile, type, address, landmark, area, pincode, city, state, country, alternate_mobile, latitiude, longitude, is_default }) => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("mobile", mobile);
    formData.append("type", type);
    formData.append("address", address);
    formData.append("landmark", landmark);
    formData.append("area", area);
    formData.append("pincode", pincode);
    formData.append("city", city);
    formData.append("state", state);
    formData.append("country", country);
    formData.append("alternate_mobile", alternate_mobile ? alternate_mobile : "");
    formData.append("latitude", latitiude);
    formData.append("longitude", longitude);
    formData.append("is_default", is_default ? 1 : 0);
    const response = await api.post(`${apiEndPoints.getAddress}/${apiEndPoints.add}`)
    return response.data;
}
export const deleteAddress = async ({ addressID }) => {
    const formData = new FormData();
    formData.append("id", addressID)
    const response = await api.post(`${apiEndPoints.getAddress}/${apiEndPoints.deleteItem}`)
    return response.data;
}
export const updateAddress = async ({ address_id, name, mobile, type, address, landmark, area, pincode, city, state, country, alternate_mobile, latitiude, longitude, is_default }) => {
    const formData = new FormData();
    formData.append("id", address_id);
    formData.append("name", name);
    formData.append("mobile", mobile);
    formData.append("type", type);
    formData.append("address", address);
    formData.append("landmark", landmark);
    formData.append("area", area);
    formData.append("pincode", pincode);
    formData.append("city", city);
    formData.append("state", state);
    formData.append("country", country);
    formData.append("alternate_mobile", alternate_mobile ? alternate_mobile : "");
    formData.append("latitude", latitiude);
    formData.append("longitude", longitude);
    formData.append("is_default", is_default ? 1 : 0);
    const response = await api.post(`${apiEndPoints.getAddress}/${apiEndPoints.update}`)
    return response.data;
}
export const fetchTimeSlot = async ({ }) => {
    const response = await api.get(`${apiEndPoints.getSettings}/${apiEndPoints.getTimeSlot}`)
    return response.data
}
export const liveOrderTracking = async ({ orderId }) => {
    const formData = new FormData();
    formData?.append("order_id", orderId);
    const response = await api.post(`${apiEndPoints.liveTracking}`, formData)
    return response.data
}