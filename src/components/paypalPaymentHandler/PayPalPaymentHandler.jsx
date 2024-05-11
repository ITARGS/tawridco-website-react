import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import "./payment-handler.css";
import Lottie from 'lottie-react';
import { toast } from "react-toastify";
import animate1 from '../../utils/order_placed_back_animation.json';
import animate2 from '../../utils/order_success_tick_animation.json';
import NoOrderSVG from "../../utils/zero-state-screens/No_Orders.svg";
import api from '../../api/api';
import Cookies from 'universal-cookie';
import { setCart, setCartCheckout, setCartProducts, setCartSubTotal } from '../../model/reducer/cartReducer';
import { useDispatch } from 'react-redux';

const PayPalPaymentHandler = () => {
    const cookies = new Cookies();
    const location = useLocation();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    // console.log(queryParams);
    const queryParamsObj = {};
    for (const [key, value] of queryParams.entries()) {
        queryParamsObj[key] = value;
        // console.log(key, value);
    }
    // console.log(queryParamsObj);

    const [timer, setTimer] = useState(5);
    const interval = useRef();
    const timeout = useRef();
    // https://devegrocer.thewrteam.in/web-payment-status?order_id=wallet-20240509133121-32&status_code=200&transaction_status=capture
    useEffect(() => {
        let intervalId;
        if (queryParamsObj.status_code == 200 && queryParamsObj.order_id.split("-")[0] == "wallet") {
            intervalId = setInterval(() => {
                window.opener.postMessage("Recharge Done", "*");
            }, 1000);
        }
        else if (queryParamsObj.type === "wallet") {
            toast.success(t("wallet_recharge_paypal_pending_message"));
        }
        else {
            try {
                api.removeCart(cookies.get("jwt_token")).then((res) => res.json()).then((result) => {
                    if (result?.status === 1) {
                        dispatch(setCart({ data: null }));
                        dispatch(setCartCheckout({ data: null }));
                        dispatch(setCartProducts({ data: [] }));
                        dispatch(setCartSubTotal({ data: 0 }));
                    }
                });
            } catch (err) {
                console.log(err.message);
            }
        }
        interval.current = setInterval(() => {
            setTimer(prev => prev - 1);
        }, 1000);
        timeout.current = setTimeout(() => {
            navigate("/");
        }, 6000);
        return () => {
            clearInterval(interval.current);
            clearTimeout(timeout);
            clearInterval(intervalId);
        };
    }, []);

    if (queryParams.size === 0) {
        return (
            <div className='container d-flex flex-column align-items-center mt-5 payment-container'>
                <img src={NoOrderSVG} alt="noOrderSVG" />
            </div>
        );
    }

    const handleNavigate = () => {
        navigate("/");
    };

    return (
        <>
            <div className='container d-flex flex-column align-items-center mt-5 payment-container' >
                <Lottie animationData={animate2} loop={false} className='lottie-tick'></Lottie>
                <Lottie className='lottie-content' animationData={animate1} loop={true}></Lottie>
                <div className='text-center'>
                    {t("order_placed_description")}
                </div>
                <button onClick={handleNavigate} className='checkout_btn'>
                    {t("go_to_home")}
                </button>
            </div>
        </>
    );
};

export default PayPalPaymentHandler;