import React, { useState, useRef, useEffect } from 'react';
import './login.css';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import api from '../../api/api';
import * as newApi from "../../api/apiCollection"
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Loader from '../loader/Loader';
import 'react-phone-input-2/lib/style.css';
import OTPInput from 'otp-input-react';
import { signInWithPhoneNumber, GoogleAuthProvider, signInWithPopup, OAuthProvider } from "firebase/auth";
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FirebaseData from '../../utils/firebase/FirebaseData';
import PhoneInput from 'react-phone-input-2';
import { setAuthId, setCurrentUser, setFcmToken, setJWTToken } from '../../model/reducer/authReducer';
import { setTokenThunk } from '../../model/thunk/loginThunk';
import { Modal } from 'react-bootstrap';
import { setSetting } from '../../model/reducer/settingReducer';
import { setFavouriteLength, setFavouriteProductIds } from '../../model/reducer/favouriteReducer';
import { addtoGuestCart, setCart, setCartProducts, setIsGuest } from '../../model/reducer/cartReducer';
import NewUserModal from '../newusermodal/NewUserModal';
import { IoCloseSharp } from "react-icons/io5";
import GoogleAuthButton from "../../utils/buttons/googleLogin.svg"
import AppleAuthButton from "../../utils/buttons/appleLogin.svg"
import { isMacOs, isIOS } from "react-device-detect"
import GoogleLogo from "../../utils/google-color-icon.svg"


const Login = React.memo((props) => {
    const Navigate = useNavigate();
    const closeModalRef = useRef();
    const dispatch = useDispatch();

    const isDemoMode = process.env.REACT_APP_DEMO_MODE
    const countryDialCode = process.env.REACT_APP_COUNTRY_DIAL_CODE
    const phoneNumber = process.env.REACT_APP_DEMO_LOGIN_NO
    const demoOTP = process.env.REACT_APP_DEMO_OTP

    const { auth, firebase, messaging } = FirebaseData();
    const setting = useSelector(state => (state.setting));
    const city = useSelector(state => state.city);
    const user = useSelector(state => state.user);
    const cart = useSelector(state => state.cart);
    const [fcm, setFcm] = useState('');
    const [registerModalShow, setRegisterModalShow] = useState(false);
    const [userEmail, setUserEmail] = useState("")
    const [userName, setUserName] = useState("")
    const [authType, setAuthType] = useState("")
    const [phonenum, setPhonenum] = useState(isDemoMode == "true" ?
        `${countryDialCode}${phoneNumber}` : "");
    const [countryCode, setCountryCode] = useState(countryDialCode);
    const [checkboxSelected, setcheckboxSelected] = useState(false);
    const [error, setError] = useState("");
    const [isOTP, setIsOTP] = useState(false);
    const [Uid, setUid] = useState("");
    const [OTP, setOTP] = useState(isDemoMode == "true" ? demoOTP : "");
    const [isLoading, setisLoading] = useState(false);
    const [timer, setTimer] = useState(null); // Initial timer value in seconds
    const [disabled, setDisabled] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        if (error !== "") {
            const timer = setTimeout(() => {
                setError("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);


    useEffect(() => {
        const initializeFirebaseMessaging = async () => {
            if (setting?.setting && messaging) {
                try {
                    const permission = await Notification.requestPermission();
                    if (permission === "granted") {
                        const currentToken = await messaging.getToken();
                        if (currentToken) {
                            setFcm(currentToken);
                            if (user?.fcm_token === null || currentToken != user?.fcm_token) {
                                dispatch(setFcmToken({ data: currentToken }));
                            }
                        } else {
                            // console.log("No registration token available");
                        }
                    } else {
                        setFcm("");
                        // console.log("Notification permission denied");
                    }
                } catch (error) {
                    console.log("An error occurred:", error);
                }
            }
        };

        if (setting.setting?.firebase) {
            initializeFirebaseMessaging();
        }
    }, [setting]);

    useEffect(() => {
        if (props.show == true) {
            setPhonenum(isDemoMode == "true" ? `${countryDialCode}${phoneNumber}` : "");
            setCountryCode(isDemoMode == "true" ? countryCode : ""
            );
            setOTP(isDemoMode == "true" ? demoOTP : "");
        }
    }, [props.show]);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else if (timer === 0) {
            setDisabled(false);
        }

        return () => clearInterval(interval);

    }, [timer]);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };


    useEffect(() => {
        const recaptchaContainer = document.getElementById('recaptcha-container');
        firebase && auth && !(window.recaptchaVerifier) && (window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(recaptchaContainer, {
            size: "invisible",
        }));
        return () => {
            if (window?.recaptchaVerifier && setting.setting.firebase) {
                try {
                    window?.recaptchaVerifier?.clear();
                } catch (err) {
                    console.log(err?.message);
                }
            }
        };
    }, [firebase, auth]);

    const handleLogin = async (e) => {
        setDisabled(true);
        setisLoading(true);
        e.preventDefault();
        if (phonenum?.length < countryCode.length || phonenum?.slice(1) === countryCode) {
            setError("Please enter phone number!");
            setisLoading(false);
        }
        else {
            let appVerifier = window?.recaptchaVerifier;
            try {
                const confirmationResult = await signInWithPhoneNumber(auth, phonenum, appVerifier)
                window.confirmationResult = confirmationResult;
                setTimer(90)
                setIsOTP(true)
                setisLoading(false)
            } catch (error) {
                setPhonenum();
                setError(error.message);
                setisLoading(false);
            }
        }
    };


    const getCurrentUser = async () => {
        try {
            const response = await newApi.getUser()
            dispatch(setCurrentUser({ data: response.user }));
            toast.success("You're successfully Logged In");
        } catch (error) {
            console.log("error", error)
        }
    };

    const fetchCart = async (latitude, longitude) => {
        try {
            const response = await newApi.getCart({ latitude: latitude, longitude: longitude })
            if (response.status === 1) {
                dispatch(setCart({ data: response.data }))
                const productsData = getProductData(response.data)
                dispatch(setCartProducts({ data: productsData }));
            } else {
                dispatch(setCart({ data: null }));
            }
        } catch (error) {
            console.log("error", error)
        }
    }
    const getProductData = (cartData) => {
        const cartProducts = cartData?.cart?.map((product) => {
            return {
                product_id: product?.product_id,
                product_variant_id: product?.product_variant_id,
                qty: product?.qty
            }
        })
        return cartProducts;
    }

    const verifyOTP = async (e) => {
        try {
            e.preventDefault();
            setisLoading(true);
            let confirmationResult = window.confirmationResult;
            const OTPResult = await confirmationResult.confirm(OTP)
            setUid(OTPResult.user.id)
            dispatch(setAuthId({ data: OTPResult.user.id }));
            await loginApiCall(OTPResult.user, OTPResult.user.uid, fcm, "phone")
            const num = phonenum.replace(`${countryCode}`, "");
        } catch (error) {
            console.log("error", error)
            setisLoading(false);
            setOTP("");
            setError("Invalid Code");
        }
    }

    const AddtoCartBulk = async (token) => {
        try {
            const variantIds = cart?.guestCart?.map((p) => p.product_variant_id);
            const quantities = cart?.guestCart?.map((p) => p.qty);
            const response = await api.bulkAddToCart(token, variantIds.join(","), quantities.join(","));
            const result = await response.json();
            if (result.status == 1) {
                dispatch(addtoGuestCart({ data: [] }));
            } else {
                console.log("Add to Bulk Cart Error Occurred");
            }
        } catch (e) {
            console.log(e?.message);
        }
    };

    const handleFetchSetting = async () => {
        const setting = await newApi.getSetting()
        dispatch(setSetting({ data: setting?.data }));
        dispatch(setFavouriteLength({ data: setting?.data?.favorite_product_ids?.length }));
        dispatch(setFavouriteProductIds({ data: setting?.data?.favorite_product_ids }));
    }


    const loginApiCall = async (user, Uid, fcm, type) => {
        let latitude;
        let longitude;
        try {
            // For forcefully refresh token for remove error
            await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
            await firebase.auth().currentUser?.getIdToken(true);
            // for login user functionality 
            dispatch(setAuthId({ data: Uid }))
            const res = await newApi.login({ Uid, fcm })
            if (res.status === 1) {
                const tokenSet = await dispatch(setTokenThunk(res?.data?.access_token))
                await getCurrentUser()
                if (res?.data?.user?.status == 1) {
                    dispatch(setIsGuest({ data: false }));
                }
                await handleFetchSetting();
                latitude = city?.city?.latitude || setting?.setting?.default_city?.latitude
                longitude = city?.city?.longitude || setting?.setting?.default_city?.longitude
                if (cart?.isGuest === true && cart?.guestCart?.length !== 0 && res?.data?.user?.status == 1) {
                    await AddtoCartBulk(res?.data.access_token);
                }
                await fetchCart(latitude, longitude);
                setError("");
                setOTP("");
                setPhonenum("");
                setisLoading(false);
                setIsOTP(false);
                props.setShow(false);
            } else {
                setUserEmail(user?.providerData?.[0]?.email)
                setUserName(user?.providerData?.[0]?.displayName)
                setPhonenum(user?.providerData?.[0]?.phoneNumber)
                setAuthType(type)
                setRegisterModalShow(true)
            }
            setisLoading(false)
        } catch (error) {
            console.error("error", error)
            setisLoading(false)
        }

    }
    const handleGoogleAuthentication = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider)
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
            await loginApiCall(user, user.uid, fcm, "google")
        } catch (error) {
            console.log("error", error)
        }


    }

    const handleTerms = () => {
        props.setShow(false);
        // Navigate('/terms');
    };
    const handlePolicy = () => {
        props.setShow(false);
        // Navigate('/policy/Privacy_Policy');
    };

    const handleOnPhoneChange = (value, data, event, formattedValue) => {
        //console.log(value, ' formattedValue');
        if (value?.length > 0) {
            setPhonenum(`+${value}`);
        } else {
            setPhonenum("");
        }
        setCountryCode(data?.dialCode);
        setOTP("");
    };
    const newReturn = (
        <>
            <Modal
                size='md'
                className='login'
                show={props.show}
                centered
                backdrop="static"
            >
                <Modal.Header className='d-flex flex-row justify-content-between align-items-center header'>
                    <div>
                        {isOTP ? <h5 className='login-heading'>{t("otp_verify")}</h5> :
                            <h5 className='login-heading'>{t("Login")}</h5>
                        }
                    </div>
                    <IoCloseSharp type='button' className='closeBtn' size={30} onClick={() => {
                        setError("");
                        setOTP("");
                        setPhonenum("");
                        setcheckboxSelected(false);
                        setisLoading(false);
                        setIsOTP(false);
                        props.setShow(false);
                    }} />
                </Modal.Header>
                <Modal.Body className='d-flex flex-column gap-3  body'>
                    {/* <img src={setting.setting && setting.setting.web_settings.web_logo} alt='logo'></img> */}
                    <div className='my-5'>
                        {isOTP
                            ? (
                                <>
                                    <h5>{t("enter_verification_code")}</h5>
                                    <span className='d-flex flex-column text-start align-items-start otp-message'>{t("otp_send_message")} <p className='font-weight-bold py-2 text-secondary'>{phonenum}</p></span>
                                </>
                            )
                            : (
                                <>
                                    <h5>{t("Welcome")}</h5>
                                    <span>{t("login_enter_number")}</span>
                                </>
                            )}
                    </div>
                    {error !== '' && <span className='error-msg'>{error}</span>}
                    {isOTP
                        ? (
                            <form className='d-flex flex-column gap-3 form w-100' onSubmit={verifyOTP}>
                                {isLoading && (
                                    <Loader width='100%' height='auto' />
                                )}
                                <OTPInput className='otp-container' inputStyle="otp-container-style" value={OTP} onChange={setOTP} autoFocus OTPLength={6} otpType="number" disabled={false} />
                                <span className='timer' >
                                    <button onClick={handleLogin} disabled={disabled}>
                                        {timer === 0 ?
                                            `Resend OTP` : <>Resend OTP in <strong> {formatTime(timer)} </strong> </>}
                                    </button> </span>
                                <span className='button-container d-flex gap-5'>
                                    <button type="submit" className='login-btn' >{t("verify_and_proceed")}</button>
                                </span>
                            </form>
                        )
                        : (
                            <div>
                                <form className='d-flex flex-column gap-3 form' onSubmit={handleLogin}>
                                    {isLoading && (
                                        <Loader width='100%' height='auto' />
                                    )}
                                    <div>
                                        <PhoneInput
                                            country={process.env.REACT_APP_COUNTRY_CODE}
                                            value={phonenum}
                                            onChange={handleOnPhoneChange}
                                            enableSearch
                                            disableSearchIcon
                                            placeholder={t('please_enter_valid_phone_number')}
                                            disableDropdown={false}
                                            inputClass='loginInput'
                                            searchClass='loginSearch'
                                        />
                                    </div>
                                    {/* <span style={{ alignSelf: "baseline" }}>
                                        <input type="checkbox" className='mx-2' required checked={checkboxSelected} onChange={() => {
                                            setcheckboxSelected(!checkboxSelected);
                                        }} />


                                        {t("agreement_message")} &nbsp;<Link to={"/terms"} onClick={handleTerms}>{t("terms_of_service")}</Link> &nbsp;{t("and")}
                                        <Link to={"/policy/Privacy_Policy"} onClick={handlePolicy}>&nbsp; {t("privacy_policy")} &nbsp;</Link>
                                    </span> */}
                                    <button type='submit'> {t("login_continue")}</button>
                                </form>
                                <p className='text-center login-or'>OR</p>


                                <div className='google-auth-container'>
                                    <button className='login-google-btn' onClick={handleGoogleAuthentication}><img src={GoogleLogo} className='google-log-img' />{t("continue_with_google")}</button>
                                </div>

                                <span style={{ alignSelf: "baseline", marginTop: "20px", fontSize: "12px" }}>
                                    {/* <input type="checkbox" className='mx-2' required checked={checkboxSelected} onChange={() => {
                                        setcheckboxSelected(!checkboxSelected);
                                    }} /> */}

                                    {t("agreement_updated_message")} &nbsp;<Link to={"/terms"} onClick={handleTerms}>{t("terms_of_service")}</Link> &nbsp;{t("and")}
                                    <Link to={"/policy/Privacy_Policy"} onClick={handlePolicy}>&nbsp; {t("privacy_policy")} &nbsp;</Link>
                                </span>
                            </div>
                        )}
                </Modal.Body>
            </Modal>
            <div id="recaptcha-container" style={{ display: "none" }}></div>
            <NewUserModal
                registerModalShow={registerModalShow}
                setRegisterModalShow={setRegisterModalShow}
                phoneNum={phonenum}
                setPhoneNum={setPhonenum}
                countryCode={countryCode.replace("+", "")}
                userEmail={userEmail}
                setUserEmail={setUserEmail}
                userName={userName}
                setUserName={setUserName}
                authType={authType}
                setLoginModal={props.setShow}
                setIsOTP={setIsOTP}
            />
        </>
    );
    return newReturn;
});

export default Login;