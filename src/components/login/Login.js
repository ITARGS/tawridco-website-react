import React, { useState, useRef, useEffect } from 'react';
import './login.css';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import api from '../../api/api';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Loader from '../loader/Loader';
import 'react-phone-input-2/lib/style.css';
//phone number input
//otp
import OTPInput from 'otp-input-react';
//firebase
import { signInWithPhoneNumber } from "firebase/auth";
import Cookies from 'universal-cookie';
// import jwt from 'jwt-decode';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FirebaseData from '../../utils/firebase/FirebaseData';
import PhoneInput from 'react-phone-input-2';
import { setAuthId, setCurrentUser, setFcmToken, setJWTToken } from '../../model/reducer/authReducer';
import { Modal } from 'react-bootstrap';
import { setSetting } from '../../model/reducer/settingReducer';
import { setFavouriteLength, setFavouriteProductIds } from '../../model/reducer/favouriteReducer';
import { setCart } from '../../model/reducer/cartReducer';


const Login = React.memo((props) => {

    const { auth, firebase, messaging } = FirebaseData();
    const setting = useSelector(state => (state.setting));
    const city = useSelector(state => state.city);
    const user = useSelector(state => state.user);
    const [fcm, setFcm] = useState('');

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
    // console.log(fcm);

    //initialize Cookies
    const cookies = new Cookies();
    const Navigate = useNavigate();
    const closeModalRef = useRef();
    const dispatch = useDispatch();

    const [phonenum, setPhonenum] = useState(process.env.REACT_APP_DEMO_MODE == "true" ?
        `${process.env.REACT_APP_COUNTRY_DIAL_CODE}${process.env.REACT_APP_DEMO_LOGIN_NO}` : "");

    const [countryCode, setCountryCode] = useState(process.env.REACT_APP_COUNTRY_DIAL_CODE);
    const [checkboxSelected, setcheckboxSelected] = useState(false);
    const [error, setError] = useState("", setTimeout(() => {
        if (error !== "")
            setError("");
    }, 5000));
    const [isOTP, setIsOTP] = useState(false);
    const [Uid, setUid] = useState("");
    const [OTP, setOTP] = useState(process.env.REACT_APP_DEMO_MODE == "true" ? process.env.REACT_APP_DEMO_OTP : "");
    const [isLoading, setisLoading] = useState(false);
    const [timer, setTimer] = useState(null); // Initial timer value in seconds
    const [disabled, setDisabled] = useState(true);


    // console.log(phonenum, countryCode);

    useEffect(() => {
        if (props.show == true) {
            setPhonenum(process.env.REACT_APP_DEMO_MODE == "true" ?
                `${process.env.REACT_APP_COUNTRY_DIAL_CODE}${process.env.REACT_APP_DEMO_LOGIN_NO}` : "");
            setCountryCode(process.env.REACT_APP_DEMO_MODE == "true" ?
                process.env.REACT_APP_COUNTRY_DIAL_CODE : ""
            );
            setOTP(process.env.REACT_APP_DEMO_MODE == "true" ? process.env.REACT_APP_DEMO_OTP : "");
        }
    }, [props.show]);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else if (timer === 0) {
            setDisabled(false); // Enable the button once the timer reaches 0
        }

        return () => clearInterval(interval); // Cleanup the interval on unmount or timer reset

    }, [timer]);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };


    useEffect(() => {
        if (firebase && auth && window.recaptchaVerifier && setting.setting.firebase) {
            if (window?.recaptchaVerifier) {
                try {
                    window?.recaptchaVerifier?.clear();
                } catch (err) {
                    console.log(err?.message);
                }
            }

        }
        const recaptchaContainer = document.getElementById('recaptcha-container');
        firebase && auth && !(window.recaptchaVerifier) && (window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(recaptchaContainer, {
            size: "invisible",
            // other options
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


    const handleLogin = (e) => {
        setDisabled(true);
        setisLoading(true);
        e.preventDefault();
        if (!checkboxSelected) {
            setError("Accept Terms and Policies!");
            setisLoading(false);
        }
        else {
            if (phonenum?.length < countryCode.length || phonenum.slice(1) === countryCode) {
                setError("Please enter phone number!");
                setisLoading(false);
            }
            else {
                // setOTP("");

                //OTP Generation
                // generateRecaptcha();
                let appVerifier = window?.recaptchaVerifier;
                try {
                    signInWithPhoneNumber(auth, phonenum, appVerifier)
                        .then(confirmationResult => {
                            window.confirmationResult = confirmationResult;
                            setTimer(90);
                            setIsOTP(true);
                            setisLoading(false);
                        }).catch((err) => {
                            setPhonenum();
                            console.log(err.message);
                            setError(err.message);
                            setisLoading(false);
                        });
                } catch (error) {
                    setisLoading(false);
                    toast.error(error);
                }

            }
            // else {
            //     setPhonenum()
            //     setError("Enter a valid phone number")
            // }
        }
    };


    const getCurrentUser = (token) => {
        api.getUser(token)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    dispatch(setCurrentUser({ data: result.user }));
                    // dispatch({ type: ActionTypes.SET_CURRENT_USER, payload: result.user });
                    toast.success("You're successfully Logged In");
                }
            });
    };
    const fetchCart = async (token, latitude, longitude) => {
        await api.getCart(token, latitude, longitude)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    dispatch(setCart({ data: result }));
                }
                else {
                    dispatch(setCart({ data: null }));
                }
            })
            .catch(error => console.log(error));
    };
    //otp verification
    const verifyOTP = async (e) => {
        e.preventDefault();
        setisLoading(true);

        let confirmationResult = window.confirmationResult;


        await confirmationResult.confirm(OTP).then((result) => {
            // User verified successfully.
            setUid(result.user.uid);

            //login call
            // console.log(phonenum);
            const num = phonenum.replace(`${countryCode}`, "");
            loginApiCall(num.replace("+", ""), result.user.uid, countryCode.replace("+", ""));



        }).catch(() => {
            setisLoading(false);
            // User couldn't sign in (bad verification code?)
            setOTP("");
            setError("Invalid Code");

        });
    };

    const loginApiCall = async (num, Uid, countrycode) => {
        // console.log("Before Login API Call ->", num, Uid, countrycode);
        await api.login(num, Uid, countrycode, fcm)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    // const decoded = jwt(result.data.access_token);

                    const tomorrow = new Date();
                    tomorrow.setDate(new Date().getDate() + 1);
                    cookies.set("jwt_token", result.data.access_token, {
                        expires: new Date(tomorrow)
                    });
                    getCurrentUser(result.data.access_token);
                    api.getSettings(1, result.data.access_token)
                        .then((req) => req.json())
                        .then((res) => {
                            if (res.status == 1) {
                                dispatch(setSetting({ data: res?.data }));
                                dispatch(setFavouriteLength({ data: res?.data?.favorite_product_ids?.length }));
                                dispatch(setFavouriteProductIds({ data: res?.data?.favorite_product_ids }));
                            }
                        });
                    fetchCart(result.data.access_token, city?.city?.latitude ? city?.city?.latitude : setting?.setting?.default_city?.latitude,
                        city?.city?.longitude ? city?.city?.longitude : setting?.setting?.default_city?.longitude
                    );
                    dispatch(setJWTToken({ data: result.data.access_token }));
                    dispatch(setAuthId({ data: Uid }));
                    // setlocalstorageOTP(Uid);
                    setError("");
                    setOTP("");
                    setPhonenum("");
                    setcheckboxSelected(false);
                    setisLoading(false);
                    setIsOTP(false);
                    props.setShow(false);
                    // closeModalRef.current.click();
                }
                else {
                    setError(result.message);
                    setOTP("");

                }

                setisLoading(false);
            })
            .catch(error => console.log("error ", error));

    };

    const handleTerms = () => {
        props.setShow(false);
        // Navigate('/terms');
    };
    const handlePolicy = () => {
        props.setShow(false);
        // Navigate('/policy/Privacy_Policy');
    };

    const handleOnChange = (value, data, event, formattedValue) => {
        //console.log(value, ' formattedValue');
        if (value?.length > 0) {
            setPhonenum(`+${value}`);
        } else {
            setPhonenum("");
        }
        setCountryCode(data?.dialCode);
        setOTP("");
    };
    const { t } = useTranslation();
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
                        <h5>{t("Login")}</h5>
                    </div>
                    <AiOutlineCloseCircle type='button' fill='black' size={30} onClick={() => {
                        setError("");
                        setOTP("");
                        setPhonenum("");
                        setcheckboxSelected(false);
                        setisLoading(false);
                        setIsOTP(false);
                        props.setShow(false);
                    }} />
                </Modal.Header>
                <Modal.Body className='d-flex flex-column gap-3 align-items-center body'>
                    <img src={setting.setting && setting.setting.web_settings.web_logo} alt='logo'></img>

                    {isOTP
                        ? (
                            <>
                                <h5>{t("enter_verification_code")}</h5>
                                <span>{t("otp_send_message")} <p>{phonenum}</p></span>
                            </>
                        )
                        : (
                            <>
                                <h5>{t("Welcome")}</h5>
                                <span>{t("login_enter_number")}</span>
                            </>
                        )}

                    {error === ''
                        ? ""
                        : <span className='error-msg'>{error}</span>}

                    {isOTP
                        ? (
                            <form className='d-flex flex-column gap-3 form w-100' onSubmit={verifyOTP}>
                                {isLoading
                                    ? (
                                        <Loader width='100%' height='auto' />
                                    )
                                    : null}
                                <OTPInput className='otp-container' value={OTP} onChange={setOTP} autoFocus OTPLength={6} otpType="number" disabled={false} />
                                <span className='timer' >
                                    <button onClick={handleLogin} disabled={disabled}>
                                        {timer === 0 ?
                                            `Resend OTP` : <>Resend OTP in : <strong> {formatTime(timer)} </strong> </>}
                                    </button> </span>
                                <span className='button-container d-flex gap-5'>

                                    <button type="submit" className='login-btn' >{t("verify_and_proceed")}</button>


                                </span>
                            </form>
                        )
                        : (
                            <form className='d-flex flex-column gap-3 form' onSubmit={handleLogin}>
                                {isLoading
                                    ? (
                                        <Loader width='100%' height='auto' />
                                    )
                                    : null}


                                <div>
                                    <PhoneInput
                                        country={process.env.REACT_APP_COUNTRY_CODE}
                                        value={phonenum}
                                        onChange={handleOnChange}
                                        enableSearch
                                        disableSearchIcon
                                        placeholder={t('please_enter_valid_phone_number')}
                                        disableDropdown={false}
                                    />
                                </div>


                                <span style={{ alignSelf: "baseline" }}>
                                    <input type="checkbox" className='mx-2' required checked={checkboxSelected} onChange={() => {
                                        setcheckboxSelected(!checkboxSelected);
                                    }} />
                                    {t("agreement_message")} &nbsp;<Link to={"/terms"} onClick={handleTerms}>{t("terms_of_service")}</Link> &nbsp;{t("and")}
                                    <Link to={"/policy/Privacy_Policy"} onClick={handlePolicy}>&nbsp; {t("privacy_policy")} &nbsp;</Link>
                                </span>
                                <button type='submit'> {t("login_continue")}</button>
                            </form>
                        )}
                </Modal.Body>
            </Modal>
            <div id="recaptcha-container" style={{ display: "none" }}></div>
        </>
    );
    return newReturn;
});

export default Login;
// useEffect(() => {
//     if (navigator.serviceWorker.controller) {
//         navigator.serviceWorker.controller.postMessage({
//             type: 'FIREBASE_CONFIG',
//             config: {
//                 apiKey: setting?.setting && setting?.setting?.firebase?.apiKey,
//                 authDomain: setting?.setting && setting?.setting?.firebase?.authDomain,
//                 projectId: setting?.setting && setting?.setting?.firebase?.projectId,
//                 storageBucket: setting?.setting && setting?.setting?.firebase?.storageBucket,
//                 messagingSenderId: setting?.setting && setting?.setting?.firebase?.messagingSenderId,
//                 appId: setting?.setting && setting?.setting?.firebase?.appId,
//                 measurementId: setting?.setting && setting?.setting?.firebase?.measurementId,
//             },
//         });
//     } else {
//         navigator.serviceWorker.ready.then(registration => {
//             registration.active.postMessage({
//                 type: 'FIREBASE_CONFIG',
//                 config: {
//                     apiKey: setting?.setting && setting?.setting?.firebase?.apiKey,
//                     authDomain: setting?.setting && setting?.setting?.firebase?.authDomain,
//                     projectId: setting?.setting && setting?.setting?.firebase?.projectId,
//                     storageBucket: setting?.setting && setting?.setting?.firebase?.storageBucket,
//                     messagingSenderId: setting?.setting && setting?.setting?.firebase?.messagingSenderId,
//                     appId: setting?.setting && setting?.setting?.firebase?.appId,
//                     measurementId: setting?.setting && setting?.setting?.firebase?.measurementId,
//                 },
//             });
//         });
//     }

// }, [setting?.setting?.firebase]);