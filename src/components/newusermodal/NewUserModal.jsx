import React, { useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../api/api';
import { toast } from 'react-toastify';
import '../login/login.css';
import './newmodal.css';
import { useTranslation } from 'react-i18next';
import { setCurrentUser, setJWTToken } from "../../model/reducer/authReducer";
import { setFavouriteLength, setFavouriteProductIds } from '../../model/reducer/favouriteReducer';
import { addtoGuestCart, setCart, setCartProducts, setIsGuest } from '../../model/reducer/cartReducer';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { setSetting } from '../../model/reducer/settingReducer';


function NewUserModal({ registerModalShow, setRegisterModalShow, phoneNum, setPhoneNum, countryCode, userEmail, setUserEmail, userName, setUserName, authType, setLoginModal }) {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const user = useSelector((state) => state.user);
    const setting = useSelector((state) => state.setting);
    const cart = useSelector((state) => state.cart);
    const fcm_token = useSelector((state) => state.user.fcm_token)
    const auth_id = useSelector((state) => state.user.authId)
    const city = useSelector(state => state.city);
    // const [username, setusername] = useState();
    // const [useremail, setuseremail] = useState();
    const [isLoading, setisLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState("");

    const closeModalRef = useRef();

    const handleUpdateUser = (e) => {
        e.preventDefault();

        setisLoading(true);
        // if (user?.jwtToken !== "") {
        api.login(phoneNum.replace(`+${countryCode}`, ""), user?.authId, countryCode)
            .then((res) => res.json())
            .then((result) => {
                const token = result?.data?.access_token;
                dispatch(setJWTToken({ data: token }));
                api.edit_profile(userName, userName, selectedFile, token)
                    .then(response => response.json())
                    .then(result => {
                        if (result.status === 1) {
                            getCurrentUser(token);
                            if (cart?.isGuest === true && cart?.guestCart?.length !== 0) {
                                dispatch(setIsGuest({ data: false }));
                                AddtoCartBulk(user?.jwtToken);
                            }
                            // setuseremail();
                            // setusername();
                            setRegisterModalShow(false);
                            // closeModalRef.current.click()
                        }
                        else {
                            setError(result.message);
                            setisLoading(false);
                        }
                    });
            });
        // }

    };



    const handleUserRegistration = async (e) => {
        e.preventDefault();
        try {
            if (phoneNum?.length < countryCode.length || phoneNum == null) {
                setError("Please enter phone number!");
                setisLoading(false);
            } else {
                await api.register(auth_id, userName, userEmail, phoneNum, authType, fcm_token, countryCode).then(response => response.json()).then(async (result) => {
                    if (result.status == 1) {
                        getCurrentUser(result.data.access_token)
                        api.getSettings(1, result.data.access_token)
                            .then((req) => req.json())
                            .then((res) => {
                                if (res.status == 1) {
                                    dispatch(setSetting({ data: res?.data }));
                                    dispatch(setFavouriteLength({ data: res?.data?.favorite_product_ids?.length }));
                                    dispatch(setFavouriteProductIds({ data: res?.data?.favorite_product_ids }));
                                }
                            });

                        dispatch(setJWTToken({ data: result.data.access_token }));
                        // dispatch(setAuthId({ data: Uid }));

                        if (result.data?.user?.status == 1) {
                            dispatch(setIsGuest({ data: false }));
                        }
                        if (cart?.isGuest === true && cart?.guestCart?.length !== 0 && result.data?.user?.status == 1) {
                            await AddtoCartBulk(result.data.access_token);
                            // dispatch(setIsGuest({ data: false }));
                        }
                        await fetchCart(result.data.access_token, city?.city?.latitude ? city?.city?.latitude : setting?.setting?.default_city?.latitude,
                            city?.city?.longitude ? city?.city?.longitude : setting?.setting?.default_city?.longitude
                        );
                    }
                    setRegisterModalShow(false)
                    toast.success(t("register_successfully"));
                    setLoginModal(false)
                }).catch((err) => {
                    console.log(err)
                })
            }
        } catch (error) {
            console.log(error)
        }
    }

    const fetchCart = async (token, latitude, longitude) => {
        await api.getCart(token, latitude, longitude)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    dispatch(setCart({ data: result }));
                    const productsData = result?.data?.cart?.map((product) => {
                        return {
                            product_id: product?.product_id,
                            product_variant_id: product?.product_variant_id,
                            qty: product?.qty
                        };
                    });
                    dispatch(setCartProducts({ data: productsData }));
                }
                else {
                    dispatch(setCart({ data: null }));
                }
            })
            .catch(error => console.log(error));
    };

    const AddtoCartBulk = async (token) => {
        try {
            const variantIds = cart?.guestCart?.map((p) => p.product_variant_id);
            const quantities = cart?.guestCart?.map((p) => p.qty);
            const response = await api.bulkAddToCart(token, variantIds.join(","), quantities.join(","));
            const result = await response.json();
            if (result.status == 1) {
                // toast.success(t("guest_products_added_to_cart"));
                dispatch(addtoGuestCart({ data: [] }));
            } else {
                console.log("Add to Bulk Cart Error Occurred");
            }
        } catch (e) {
            console.log(e?.message);
        }
    };

    const getCurrentUser = (token) => {
        api.getUser(token)
            .then(response => response.json())
            .then(result => {
                if (!result.user.status) {
                    setisLoading(false);
                    dispatch(setCurrentUser({ data: result.user }));
                } else {

                    if (result.status === 1) {
                        dispatch(setCurrentUser({ data: result.user }));
                        if (closeModalRef.current && result.user.status) {
                            closeModalRef.current.click();
                        }

                        setisLoading(false);
                    }
                }
            });
    };

    return (
        <Modal
            // show={user.user && user.user.status == 2}
            show={registerModalShow}
            backdrop="static"
            keyboard={true}
            className='user_data_modal'>


            <Modal.Header className='web_logo'>

                <img src={setting.setting && setting.setting.web_settings.web_logo} alt="" />
                <AiOutlineCloseCircle className='cursorPointer' size={20} onClick={() => {
                    setRegisterModalShow(false);
                    // setusername();
                    // setuseremail();
                }} />
            </Modal.Header>
            <Modal.Body
                className='user_data_modal_body'>
                <span className='note'>{t("profile_note")}</span>
                {error === ""
                    ? ""
                    : <span className='error-msg'>{error}</span>}
                <form onSubmit={handleUserRegistration} className='userData-Form'>
                    <div className='inputs-container'>
                        <input type='text' placeholder={t('user_name')} value={userName} onChange={(e) => {
                            setError("");
                            setUserName(e.target.value);
                        }} required />
                        <input type='email' placeholder={t('email_address')} disabled={authType == "google"} value={userEmail} onChange={(e) => {
                            setError("");
                            setUserEmail(e.target.value);
                        }}
                            style={authType == "google" ? { color: "var(--sub-text-color)" } : { color: "black" }}
                            required />
                        <input type='tel' placeholder={t('mobile_number')} disabled={authType == "phone"} value={phoneNum} style={authType == "phone" ? { color: "var(--sub-text-color)" } : { color: "black" }} onChange={(e) => setPhoneNum(e.target.value)} />
                    </div>
                    <button type='submit' disabled={isLoading} >{t("register")} {t("profile")}</button>
                </form>
                {error ? <p className='user_data_form_error'>{error}</p> : ""}
            </Modal.Body>
        </Modal>
    );
}

export default NewUserModal;
