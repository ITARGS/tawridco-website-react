import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Calendar } from 'react-calendar';
import coverImg from '../../utils/cover-img.jpg';
import Address from '../address/Address';
import './checkout.css';
import 'react-calendar/dist/Calendar.css';
import api from '../../api/api';
import rozerpay from '../../utils/ic_razorpay.svg';
import paystack from '../../utils/ic_paystack.svg';
import Stripe from '../../utils/ic_stripe.svg';
import cod from '../../utils/ic_cod.svg';
import { useDispatch, useSelector } from 'react-redux';
import paypal from "../../utils/ic_paypal.svg";
import Cookies from 'universal-cookie';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Modal from 'react-bootstrap/Modal';

//lottie animation JSONs
import Lottie, { useLottie } from 'lottie-react';
import animate1 from '../../utils/order_placed_back_animation.json';
import animate2 from '../../utils/order_success_tick_animation.json';

//payment methods
import useRazorpay, { Razorpay } from 'react-razorpay';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
} from '@stripe/react-stripe-js';
// import CheckoutForm from './CheckoutForm'
import InjectCheckout from './StripeModal';
import PaystackPop from '@paystack/inline-js';
import Loader from '../loader/Loader';
import { Button } from 'react-bootstrap';
import { ActionTypes } from '../../model/action-type';
import { RiCoupon2Fill } from 'react-icons/ri';
import Promo from '../cart/Promo';
import { useTranslation } from 'react-i18next';
import { clearCartPromo, setCart, setCartCheckout, setCartPromo, setWallet } from '../../model/reducer/cartReducer';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { PiWallet } from "react-icons/pi";
import { deductUserBalance } from '../../model/reducer/authReducer';



const Checkout = () => {
    const dispatch = useDispatch();
    const city = useSelector(state => state.city);
    const cart = useSelector(state => (state.cart));
    const address = useSelector((state) => state.address);
    const user = useSelector(state => (state.user));
    const setting = useSelector(state => (state.setting));
    const [paymentUrl, setpaymentUrl] = useState(null);
    const [codAllow, setCodAllow] = useState(0);
    const [totalPayment, setTotalPayment] = useState(null);
    const [walletDeductionAmt, setWalletDeductionAmt] = useState(null);
    const [order, setOrder] = useState(false);
    const [walletAmount, setWalletAmount] = useState(user?.user?.balance);
    const [isPromoApplied, setIsPromoApplied] = useState(false);
    const [IsOrderPlaced, setIsOrderPlaced] = useState(false);


    const paypalStatus = useRef(false);

    const cookies = new Cookies();
    const navigate = useNavigate();

    const stripePromise = loadStripe(setting.payment_setting && setting.payment_setting.stripe_publishable_key);


    useEffect(() => {
        api.getCart(cookies.get('jwt_token'), city.city.latitude, city.city.longitude, 1)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    dispatch(setCartCheckout({ data: result.data }));
                    dispatch(setWallet({ data: 0 }));
                    if (cart?.promo_code) {
                        setTotalPayment(result.data.total_amount - cart?.promo_code?.discount);
                    } else {
                        setTotalPayment(result.data.total_amount);
                    }
                    setWalletAmount(user?.user?.balance);
                    // dispatch({ type: ActionTypes.SET_CART_CHECKOUT, payload: result.data });
                }

            })
            .catch(error => console.log(error));

        api.getCartSeller(cookies.get('jwt_token'), city.city.latitude, city.city.longitude, 1)
            .then(res => res.json())
            .then(result => {
                setCodAllow(result?.data?.cod_allowed);

            })
            .catch(error => console.log(error));
        fetchTimeSlot();
        setpaymentMethod("COD");
    }, []);

    useEffect(() => {
        if (address?.selected_address?.latitude && address?.selected_address?.longitude)
            api.getCart(cookies.get('jwt_token'), address?.selected_address?.latitude, address?.selected_address?.longitude, 1)
                .then(response => response.json())
                .then(result => {
                    if (result.status === 1) {
                        setCodAllow(1);
                        dispatch(setCartCheckout({ data: result.data }));
                        dispatch(setWallet({ data: 0 }));
                        if (cart?.promo_code) {
                            setTotalPayment(result.data.total_amount - cart?.promo_code?.discount);
                        }
                        else {
                            setTotalPayment(result.data.total_amount);
                        }
                    }

                })
                .catch(error => console.log(error));
    }, [address?.selected_address]);


    useEffect(() => {

        const handleMessage = (event) => {
            if (event.origin === api.getAppUrl()) {
                if (event.data === "success") {
                    paypalStatus.current = true;
                    setShow(true);
                    setIsOrderPlaced(true);
                } else {
                    api.deleteOrder(cookies.get('jwt_token'), orderID);
                    toast.error("Payment failed");
                    setIsOrderPlaced(false);
                }
            }
        };


        window.addEventListener('message', handleMessage);
        // Clean up by removing the event listener when the component unmounts
        return () => {
            window.removeEventListener('message', handleMessage);
        };

    }, [window]);

    const [expectedDate, setexpectedDate] = useState(null);
    // const expectedDate = useRef(new Date())
    const checkLastOrderTime = (lastTime) => {
        const currentTime = expectedDate ? expectedDate : new Date();
        if (currentTime > new Date()) {
            return true;
        }
        const hours = lastTime.split(':')[0];
        const minutes = lastTime.split(':')[1];
        const seconds = lastTime.split(':')[2];

        const lastOrderTime = new Date();

        lastOrderTime.setHours(hours);
        lastOrderTime.setMinutes(minutes);
        lastOrderTime.setSeconds(seconds);


        return currentTime <= lastOrderTime;

    };

    const [timeslots, settimeslots] = useState(null);
    const [selectedAddress, setselectedAddress] = useState(null);
    const today = new Date();
    const [expectedTime, setexpectedTime] = useState();
    const [paymentMethod, setpaymentMethod] = useState("");
    const [deliveryTime, setDeliveryTime] = useState("");
    const [orderID, setOrderID] = useState(0);
    const [loadingPlaceOrder, setloadingPlaceOrder] = useState(false);
    const [stripeOrderId, setstripeOrderId] = useState(null);
    const [stripeClientSecret, setstripeClientSecret] = useState(null);
    const [stripeTransactionId, setstripeTransactionId] = useState(null);
    const [show, setShow] = useState(false);
    const [showPromoOffcanvas, setShowPromoOffcanvas] = useState(false);
    const [stripeModalShow, setStripeModalShow] = useState(false);
    const [isFullWalletPay, setIsFullWalletPay] = useState(false);
    // const [paymentSettings, setpaymentSettings] = useState(null)
    const [isLoader, setisLoader] = useState(false);
    const fetchTimeSlot = () => {
        api.fetchTimeSlot()
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    settimeslots(result.data);
                    setexpectedTime(result.data.time_slots.filter((element) => checkLastOrderTime(element.last_order_time))[0]);
                }
            })
            .catch(error => console.log(error));

    };

    // Filter the time slots based on last_order_time
    useEffect(() => {
        const currentDateTime = new Date();
        setexpectedDate(new Date(currentDateTime.setDate(currentDateTime.getDate() + (Number(timeslots?.time_slots_delivery_starts_from) - 1))));
    }, [timeslots]);

    useEffect(() => {
        setexpectedTime(timeslots?.time_slots.filter((element) => checkLastOrderTime(element.last_order_time))[0]);
    }, [expectedDate]);


    const [Razorpay] = useRazorpay();
    const handleRozarpayPayment = useCallback(async (order_id, razorpay_transaction_id, amount, name, email, mobile, app_name) => {
        // const amount = total_amount
        // const name = user.user.name
        // const email = user.user.email
        // const mobile = user.user.mobile
        // console.log("RazorPay Payment Handler Function");

        const res = await initializeRazorpay();

        if (!res) {
            console.error("RazorPay SDK Load Failed");
            return;
        }
        const key = setting.payment_setting && setting.payment_setting.razorpay_key;
        const convertedAmount = Math.floor(amount * 100);
        const options = {
            key: key,
            amount: convertedAmount,
            currency: "INR",
            name: name,
            description: app_name,
            image: setting.setting && setting.setting.web_settings.web_logo,
            order_id: razorpay_transaction_id,
            handler: async (res) => {
                if (res.razorpay_payment_id) {
                    setloadingPlaceOrder(true);
                    await api.addRazorpayTransaction(cookies.get('jwt_token'), order_id, res.razorpay_payment_id, res.razorpay_order_id, res.razorpay_payment_id, res.razorpay_signature)
                        .then(response => response.json())
                        .then(result => {
                            setloadingPlaceOrder(false);
                            if (result.status === 1) {
                                toast.success(result.message);
                                setIsOrderPlaced(true);
                                setShow(true);
                            }
                            else {
                                toast.error(result.message);
                            }
                        })
                        .catch(error => console.log(error));
                    //Add Transaction
                }


            },
            oncancel: async (res) => {
                handleRazorpayCancel(order_id);

            },
            modal: {
                confirm_close: true,
                ondismiss: async (reason) => {
                    if (reason === undefined) {
                        handleRazorpayCancel(order_id);
                        dispatch(deductUserBalance({ data: walletDeductionAmt ? walletDeductionAmt : 0 }));
                    }
                }
            },
            prefill: {
                name: name,
                email: email,
                contact: mobile,
            },
            notes: {
                address: "Razorpay Corporate ",
            },
            theme: {
                color: setting.setting && setting.setting.web_settings.color,
            },
        };
        const rzpay = new window.Razorpay(options);
        rzpay.on('payment.cancel', function (response) {
            alert("Payment Cancelled");
            handleRazorpayCancel(order_id);
        });
        rzpay.on('payment.failed', function (response) {
            api.deleteOrder(cookies.get('jwt_token'), order_id);
        });
        rzpay.open();

    }, [Razorpay]);

    const initializeRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            // document.body.appendChild(script);

            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };

            document.body.appendChild(script);
        });
    };
    const handleRazorpayCancel = (order_id) => {
        api.deleteOrder(cookies.get('jwt_token'), order_id);
        setWalletDeductionAmt(walletDeductionAmt);
        setWalletAmount(user.user.balance);
        setTotalPayment(totalPayment);
        setIsOrderPlaced(false);
    };

    const handlePayStackPayment = (email, amount, currency, support_email, orderid) => {
        let handler = PaystackPop.setup({
            key: setting.payment_setting && setting.payment_setting.paystack_public_key,
            email: email,
            amount: parseFloat(amount) * 100,
            currency: currency,
            ref: (new Date()).getTime().toString(),
            label: support_email,
            onClose: function () {
                api.deleteOrder(cookies.get('jwt_token'), orderid);
                setWalletAmount(user.user.balance);
                dispatch(setWallet({ data: 0 }));
            },
            callback: async function (response) {

                setloadingPlaceOrder(true);
                await api.addTransaction(cookies.get('jwt_token'), orderid, response.reference, paymentMethod, "order")
                    .then(response => response.json())
                    .then(result => {
                        setloadingPlaceOrder(false);
                        if (result.status === 1) {
                            toast.success(result.message);
                            setIsOrderPlaced(true);
                            setShow(true);
                        }
                        else {
                            toast.error(result.message);
                        }
                    })
                    .catch(error => console.log(error));

            }
        });

        handler.openIframe();
    };

    useEffect(() => {
        if (cart?.is_wallet_checked && totalPayment > walletAmount) {
            setWalletDeductionAmt(walletAmount);
            setWalletAmount(0);
            setTotalPayment(totalPayment - walletAmount);
            setIsFullWalletPay(false);
        } else if (cart?.is_wallet_checked && totalPayment <= walletAmount) {
            const remainingwalletBalance = walletAmount - totalPayment;
            setWalletDeductionAmt(totalPayment);
            setWalletAmount(remainingwalletBalance);
            setTotalPayment(0);
            setIsFullWalletPay(true);
            setpaymentMethod("Wallet");
        } else if (!cart?.is_wallet_checked && cart?.promo_code) {
            setTotalPayment(cart?.checkout?.total_amount - cart?.promo_code?.discount);
            setWalletAmount(user.user.balance);
            setWalletDeductionAmt(0);
            setIsFullWalletPay(false);
        } else {
            setTotalPayment(cart?.checkout?.total_amount);
            setWalletAmount(user.user.balance);
            setWalletDeductionAmt(0);
            setIsFullWalletPay(false);
        }
    }, [cart?.is_wallet_checked]);

    const HandlePlaceOrder = async (e) => {
        // e.preventDefault();
        //place order
        if (!expectedDate) {
            toast.error(t('please_select_date'));
        }
        else if (!address.address) {
            toast.error("Please add an address");
        }
        else if (address.selected_address === null) {
            toast.error("Please Select Delivery Address");
        }
        else {
            setDeliveryTime(`${expectedDate.getDate()}-${expectedDate.getMonth() + 1}-${expectedDate.getFullYear()} ${expectedTime.title}`);
            const delivery_time = `${expectedDate.getDate()}-${expectedDate.getMonth() + 1}-${expectedDate.getFullYear()} ${expectedTime.title}`;
            setloadingPlaceOrder(true);
            if (delivery_time === null) {
                toast.error("Please Select Preffered Delivery Time");
            }
            else if (paymentMethod === 'COD') {
                // place order
                await api.placeOrder(cookies.get('jwt_token'), cart.checkout.product_variant_id, cart.checkout.quantity, cart.checkout.sub_total, cart.checkout.delivery_charge.total_delivery_charge, cart.promo_code ? (cart.promo_code.discounted_amount + cart.checkout.delivery_charge.total_delivery_charge) : cart.checkout.total_amount, paymentMethod, address.selected_address.id, delivery_time, cart.promo_code?.promo_code_id, cart.is_wallet_checked ? (walletDeductionAmt) : null, cart.is_wallet_checked ? 1 : 0)
                    .then(response => response.json())
                    .then(async (result) => {
                        setisLoader(false);
                        if (result.status === 1) {
                            toast.success("Order Successfully Placed!");
                            setloadingPlaceOrder(false);
                            dispatch(setWallet({ data: 0 }));
                            dispatch(setCartPromo({ data: null }));
                            dispatch(deductUserBalance({ data: walletDeductionAmt }));
                            setIsOrderPlaced(true);
                            setShow(true);
                        }
                        else {
                            toast.error(result.message);
                            setloadingPlaceOrder(false);
                        }
                    })
                    .catch(error => {
                        setisLoader(false);
                        setloadingPlaceOrder(false);
                        console.log(error);
                    });
            }
            else if (paymentMethod === 'Razorpay') {
                await api.placeOrder(cookies.get('jwt_token'), cart.checkout.product_variant_id, cart.checkout.quantity, cart.checkout.sub_total, cart.checkout.delivery_charge.total_delivery_charge, cart.promo_code ? (cart.promo_code.discounted_amount + cart.checkout.delivery_charge.total_delivery_charge - walletDeductionAmt) : cart.checkout.total_amount - walletDeductionAmt, paymentMethod, address.selected_address.id, delivery_time, cart.promo_code?.promo_code_id, cart.is_wallet_checked ? (walletDeductionAmt) : null, cart.is_wallet_checked ? 1 : 0)
                    .then(response => response.json())
                    .then(async result => {

                        // fetchOrders();
                        if (result.status === 1) {
                            await api.initiate_transaction(cookies.get('jwt_token'), result.data.order_id, "Razorpay", "order")
                                .then(resp => resp.json())
                                .then(res => {
                                    setisLoader(false);

                                    if (res.status === 1) {
                                        setloadingPlaceOrder(false);
                                        dispatch(setCartPromo({ data: null }));
                                        // handleRozarpayPayment(result.data.order_id, res.data.transaction_id, cart.promo_code ? (cart.promo_code.discounted_amount + cart.checkout.delivery_charge.total_delivery_charge) : cart.checkout.total_amount, user.user.name, user.user.email, user.user.mobile, setting.setting?.app_name, walletDeductionAmt);
                                        handleRozarpayPayment(result.data.order_id, res.data.transaction_id, totalPayment, user.user.name, user.user.email, user.user.mobile, setting.setting?.app_name);
                                    }
                                    else {
                                        api.deleteOrder(cookies.get('jwt_token'), result.data.order_id);
                                        toast.error(res.message);
                                        setloadingPlaceOrder(false);
                                        setWalletAmount(walletDeductionAmt);
                                    }
                                })
                                .catch(error => {
                                    console.error(error);
                                });

                        }
                        else {
                            toast.error(result.message);
                            setloadingPlaceOrder(false);
                        }
                    })
                    .catch(error => console.log(error));
            }
            else if (paymentMethod === 'Paystack') {
                await api.placeOrder(cookies.get('jwt_token'), cart.checkout.product_variant_id, cart.checkout.quantity, cart.checkout.sub_total, cart.checkout.delivery_charge.total_delivery_charge, cart.promo_code ? (cart.promo_code.discounted_amount + cart.checkout.delivery_charge.total_delivery_charge) : cart.checkout.total_amount - walletDeductionAmt, paymentMethod, address.selected_address.id, delivery_time, cart.promo_code?.promo_code_id, cart.is_wallet_checked ? (walletDeductionAmt) : null, cart.is_wallet_checked ? 1 : 0)
                    .then(response => response.json())
                    .then(result => {
                        // fetchOrders();
                        if (result.status === 1) {
                            // dispatch(deductUserBalance({ data: walletDeductionAmt }));
                            dispatch(setCartPromo({ data: null }));
                            setloadingPlaceOrder(false);
                            setOrderID(result.data.order_id);
                            handlePayStackPayment(user.user.email, totalPayment, setting.payment_setting.paystack_currency_code, setting.setting.support_email, result.data.order_id);

                        }
                        else {
                            toast.error(result.message);
                            setloadingPlaceOrder(false);
                        }
                    })
                    .catch(error => console.log(error));

            }
            else if (paymentMethod === "Stripe") {
                setStripeModalShow(true);
                await api.placeOrder(cookies.get('jwt_token'), cart.checkout.product_variant_id, cart.checkout.quantity, cart.checkout.sub_total, cart.checkout.delivery_charge.total_delivery_charge, cart.promo_code ? (cart.promo_code.discounted_amount + cart.checkout.delivery_charge.total_delivery_charge - walletDeductionAmt) : cart.checkout.total_amount - walletDeductionAmt, paymentMethod, address.selected_address.id, delivery_time, cart.promo_code?.promo_code_id, cart.is_wallet_checked ? (walletDeductionAmt) : null, cart.is_wallet_checked ? 1 : 0)
                    .then(response => response.json())
                    .then(async result => {
                        if (result.status === 1) {


                            await api.initiate_transaction(cookies.get('jwt_token'), result.data.order_id, 'Stripe', "order")
                                .then(resp => resp.json())
                                .then(res => {
                                    if (res.status) {
                                        // dispatch(deductUserBalance({ data: walletDeductionAmt }));
                                        dispatch(setCartPromo({ data: null }));
                                        setstripeOrderId(result.data.order_id);
                                        setstripeClientSecret(res.data.client_secret);
                                        setstripeTransactionId(res.data.id);
                                    } else {
                                        // document.getElementById('stripe-toggle').click()
                                        setIsOrderPlaced(false);
                                        api.deleteOrder(cookies.get('jwt_token'), result.data.order_id);

                                    }
                                    setloadingPlaceOrder(false);
                                })
                                .catch(error => console.log(error));
                            // fetchOrders();
                        }
                        else {
                            setStripeModalShow(false);
                            toast.error(result.message);
                            setloadingPlaceOrder(false);
                        }
                    })
                    .catch(error => console.log(error));


                // setstripeOrderId(400)

                setloadingPlaceOrder(false);
            }
            else if (paymentMethod === 'Paypal') {
                await api.placeOrder(cookies.get('jwt_token'), cart.checkout.product_variant_id, cart.checkout.quantity, cart.checkout.sub_total, cart.checkout.delivery_charge.total_delivery_charge, cart.promo_code ? (cart.promo_code.discounted_amount + cart.checkout.delivery_charge.total_delivery_charge - walletDeductionAmt) : cart.checkout.total_amount - walletDeductionAmt, paymentMethod, address.selected_address.id, delivery_time, cart.promo_code?.promo_code_id, cart.is_wallet_checked ? (walletDeductionAmt) : null, cart.is_wallet_checked ? 1 : 0)
                    .then(response => response.json())
                    .then(async result => {
                        // fetchOrders();
                        if (result.status === 1) {
                            setOrderID(result.data.order_id);
                            await api.initiate_transaction(cookies.get('jwt_token'), result.data.order_id, "Paypal", "order")
                                .then(resp => resp.json())
                                .then(res => {
                                    console.log(res.data);
                                    // console.log(res.data.paypal_redirect_url)
                                    setisLoader(false);

                                    if (res.status === 1) {
                                        setloadingPlaceOrder(false);
                                        setpaymentUrl(res.data.paypal_redirect_url);
                                        dispatch(deductUserBalance({ data: walletDeductionAmt }));
                                        dispatch(setCartPromo({ data: null }));
                                        // window.open(res.data.paypal_redirect_url, '_blank', 'location=yes,height=570,width=520,scrollbars=yes,status=yes')
                                        // document.getElementById("iframe_id").contentWindow.location.href
                                        // handleRozarpayyPayment(result.data.order_id, res.data.transaction_id, cart.checkout.total_amount, user.user.name, user.user.email, user.user.mobile, setting.setting.app_name);

                                        var ccavenue_redirect_url = `${res.data.paypal_redirect_url}&&amount=${totalPayment}`;
                                        //var ccavenue_redirect_url = "https://admin.pocketgroceries.in/customer/ccavenue_payment";

                                        var subWindow = window.open(ccavenue_redirect_url, '_blank', 'location=yes,height=570,width=520,scrollbars=yes,status=yes');
                                        var redirect_url = res.data.paypal_redirect_url;
                                        /*subWindow.postMessage('Hello from parent window!', '*');
                                        console.log("redirect_url : ",redirect_url);*/
                                        const checkChildWindow = setInterval((e) => {
                                            if (subWindow && subWindow.closed) {
                                                clearInterval(checkChildWindow);
                                                // console.log('Child window is closed');
                                                if (subWindow && subWindow.closed && !paypalStatus.current) {
                                                    api.deleteOrder(cookies.get('jwt_token'), result.data.order_id);
                                                    setWalletAmount(user.user.balance);
                                                    toast.error("Payment failed ");
                                                    // Perform any actions or display a message here
                                                }

                                            }
                                        }, 1500); // Adjust the interval (in milliseconds) as needed

                                    } else {
                                        toast.error(res.message);
                                        setloadingPlaceOrder(false);
                                    }
                                })
                                .catch(error => console.error(error));

                        }
                        else {
                            toast.error(result.message);
                            setloadingPlaceOrder(false);
                            setisLoader(false);
                        }
                    })
                    .catch(error => console.log(error));
            }
            else if (paymentMethod === 'Wallet') {
                await api.placeOrder(cookies.get('jwt_token'), cart.checkout.product_variant_id, cart.checkout.quantity, cart.checkout.sub_total, cart.checkout.delivery_charge.total_delivery_charge, cart.promo_code ? (cart.promo_code.discounted_amount + cart.checkout.delivery_charge.total_delivery_charge) : cart.checkout.total_amount, paymentMethod, address.selected_address.id, delivery_time, cart.promo_code?.promo_code_id, cart.is_wallet_checked ? (walletDeductionAmt) : null, cart.is_wallet_checked ? 1 : 0)
                    .then(response => response.json())
                    .then(async (result) => {
                        setisLoader(false);
                        if (result.status === 1) {
                            toast.success("Order Successfully Placed!");
                            setloadingPlaceOrder(false);
                            dispatch(setWallet({ data: 0 }));
                            dispatch(setCartPromo({ data: null }));
                            dispatch(deductUserBalance({ data: walletDeductionAmt }));
                            setIsOrderPlaced(true);
                            setShow(true);
                        }
                        else {
                            toast.error(result.message);
                            setloadingPlaceOrder(false);
                        }
                    })
                    .catch(error => {
                        setisLoader(false);
                        setloadingPlaceOrder(false);
                        console.log(error);
                    });

                // else if (paymentMethod === "Paytm") {
                //      await api.placeOrder(cookies.get('jwt_token'), cart.checkout.product_variant_id, cart.checkout.quantity, cart.checkout.sub_total, cart.checkout.delivery_charge.total_delivery_charge, cart.promo_code ? cart.promo_code.discounted_amount: cart.checkout.total_amount, paymentMethod, address.selected_address.id, delivery_time)
                //         .then(response => response.json())
                //         .then(async result => {
                //             if (result.status === 1) {

                //             }

                //         })
                //         .catch(error => console.error(error))
                // }

            };
        }
    };

    const handleClose = () => {
        setisLoader(true);
        api.removeCart(cookies.get('jwt_token')).then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    dispatch(setCart({ data: null }));
                    dispatch(setCartCheckout({ data: null }));
                }
            });
        setShow(false);
        paypalStatus.current = false;
        navigate('/');
    };


    const removeCoupon = () => {
        dispatch(clearCartPromo());
        toast.info("Coupon Removed");
    };


    useEffect(() => {
        if (IsOrderPlaced) {
            setShow(true);
            setTimeout(async () => {
                handleClose();
            }, 5000);
        }
    }, [IsOrderPlaced]);

    const { t } = useTranslation();
    const placeHolderImage = (e) => {
        e.target.src = setting.setting?.web_logo;
    };
    const current = new Date();
    return (
        <>
            <section id='checkout'>
                {/* {console.log(IsOrderPlaced)} */}
                {IsOrderPlaced ?

                    <>
                        <Modal
                            show={show}
                            onHide={handleClose}
                            backdrop="static"
                            keyboard={true}
                            className='success_modal'
                        >
                            <Lottie className='lottie-content' animationData={animate1} loop={true}></Lottie>
                            <Modal.Header closeButton className='flex-column-reverse success_header'>
                                <Modal.Title><Lottie animationData={animate2} loop={false}></Lottie></Modal.Title>
                            </Modal.Header>
                            <Modal.Body className='success_body'>
                                {t("order_placed_description")}
                            </Modal.Body>
                            <Modal.Footer className="success_footer">
                                <Button variant="primary" onClick={handleClose} className='checkout_btn'>
                                    {t("go_to_home")}
                                </Button>

                            </Modal.Footer>
                        </Modal>
                    </>
                    : null}
                {/* //     {stripepayment ? <PaymentElement /> : null} */}
                <div className='cover'>
                    <img src={coverImg} onError={placeHolderImage} className='img-fluid' alt="cover"></img>
                    <div className='title'>
                        <h3>{t("checkout")}</h3>
                        <span><Link to="/" className="text-white text-decoration-none">{t("home")} / </Link> </span><span className='active'>{t("checkout")}</span>
                    </div>
                </div>



                {
                    !setting.payment_setting === null && !expectedTime === null
                        ? (
                            <Loader screen='full' />
                        )
                        : (
                            <>
                                <div className='checkout-container container'>

                                    <div className='checkout-util-container col-lg-9'>
                                        <div className='billibg-address-wrapper checkout-component'>
                                            <span className='heading'>{t("billing_details")}</span>

                                            <Address setselectedAddress={setselectedAddress} selectedAddress={selectedAddress} />
                                        </div>
                                        {timeslots && timeslots.time_slots_is_enabled === "true" ?
                                            <>

                                                <div className='delivery-day-wrapper checkout-component'>
                                                    <span className='heading'>{t("prefered_day")}</span>
                                                    <div className='d-flex justify-content-center p-3'>
                                                        <Calendar value={expectedDate.toString() === "Invalid Date" ? new Date(current.setDate(current.getDate() + (Number(timeslots?.time_slots_delivery_starts_from) - 1))) : expectedDate} onChange={(e) => {
                                                            if (new Date(e) >= new Date()) {
                                                                setexpectedDate(new Date(e));
                                                            }
                                                            else if (new Date(e).getDate() === new Date().getDate() && new Date(e).getMonth() === new Date().getMonth() && new Date(e).getFullYear() === new Date().getFullYear()) {
                                                                setexpectedDate(new Date(e));
                                                            }
                                                            else {
                                                                toast.info('Please Select Valid Delivery Day');
                                                            }
                                                        }}
                                                            calendarType={"gregory"}
                                                            minDate={new Date(current.setDate(current.getDate() + (Number(timeslots?.time_slots_delivery_starts_from) - 1)))}
                                                            maxDate={new Date(current.setDate(current.getDate() + (Number(timeslots?.time_slots_allowed_days - 1))))}
                                                        />
                                                    </div>
                                                </div>
                                                <div className='delivery-time-wrapper checkout-component'>
                                                    <span className='heading'>{t("prefered_time")}</span>
                                                    <div className='d-flex p-3' style={{ flexWrap: "wrap" }}>
                                                        {timeslots === null
                                                            ? <Loader screen='full' />

                                                            : (
                                                                <>

                                                                    {timeslots.time_slots.filter((element) => checkLastOrderTime(element.last_order_time)).map((timeslot, index) => {
                                                                        return (

                                                                            <div key={index} className='time-slot-container'>
                                                                                <div>
                                                                                    <input type="radio" name="TimeSlotRadio" id={`TimeSlotRadioId${index}`} defaultChecked={index === 0 ? true : false} onChange={() => {
                                                                                        setexpectedTime(timeslot);
                                                                                    }} />
                                                                                </div>
                                                                                <div>

                                                                                    {timeslot.title}
                                                                                </div>
                                                                            </div>
                                                                        );

                                                                    })}
                                                                </>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                            </>
                                            : <></>}


                                    </div>

                                    <div className='order-container'>
                                        {/* <div className="promo-section">

                                            <div className="heading">
                                                <span>{t("coupon")}</span>
                                            </div>
                                            <div className="promo-wrapper">
                                                <div className="promo-container">
                                                    <div className="promo-button d-block d-lg-flex">
                                                        <span className="">{t("have_coupon")}</span>
                                                        <button className="btn btn-primary" onClick={() => setShowPromoOffcanvas(true)}>{t("view_coupon")}</button>
                                                    </div>
                                                    {cart.cart && cart.promo_code ?
                                                        <>
                                                            <div className="promo-code">
                                                                <div className="">
                                                                    <span><RiCoupon2Fill size={26} fill='var(--secondary-color)' /></span>
                                                                </div>
                                                                <div className="d-flex flex-column">
                                                                    <span className='promo-name'>{cart.promo_code.promo_code}</span>
                                                                    <span className='promo-discount-amount'>{cart.promo_code.message}</span>
                                                                </div>
                                                                <div className="d-flex flex-column">
                                                                    <span>{setting.setting && setting.setting.currency} {cart.promo_code.discount}</span>
                                                                    <span className='promo-remove' onClick={removeCoupon}> {t("remove")}</span>
                                                                </div>
                                                            </div>
                                                        </>
                                                        : <></>}
                                                </div>
                                            </div>
                                        </div> */}
                                        {user?.user?.balance > 0 ? <div className="promo-section">
                                            <div className="heading">
                                                <span>{t("Wallet")}</span>
                                            </div>
                                            <div className='promo-wrapper'>
                                                <div className='promo-container'>
                                                    <div className='d-flex justify-content-between align-items-center'>
                                                        <div className='image-container d-flex align-items-center' style={{ gap: "15px" }}>
                                                            <PiWallet size={35} fill={'var(--secondary-color)'} />
                                                            <span style={{ fontSize: "14px" }}>
                                                                {t("Wallet Balance")}
                                                            </span>
                                                            <p style={{ color: 'var(--secondary-color', fontSize: "14px" }} className='mb-0'>
                                                                {setting?.setting?.currency}
                                                                {/* {t(parseFloat(user?.user?.balance).toFixed(setting?.setting && setting?.setting?.decimal_point))} */}

                                                                {t(parseFloat(walletAmount).toFixed(setting?.setting && setting?.setting?.decimal_point))}
                                                            </p>

                                                        </div>
                                                        <div>
                                                            <input type='checkbox' disabled={IsOrderPlaced ? true : false} checked={cart.is_wallet_checked ? true : false} onClick={() => {
                                                                cart.is_wallet_checked ? dispatch(setWallet({ data: 0 })) : dispatch(setWallet({ data: 1 }));
                                                            }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div> : null}

                                        {isFullWalletPay ? <></> :
                                            <div className='payment-wrapper checkout-component'>
                                                <span className='heading'>{t("payment_method")}</span>

                                                {setting?.payment_setting.cod_payment_method === "1" && codAllow == 1
                                                    ? (
                                                        <label className="form-check-label" htmlFor='cod'>
                                                            <div className='payment-selector'>
                                                                <div className="">
                                                                    <img src={cod} alt='cod' />
                                                                    <span>{t("cash_on_delivery")}</span>
                                                                </div>
                                                                <input type="radio" name="payment-method" id='cod' defaultChecked={true} onChange={() => {
                                                                    setpaymentMethod("COD");
                                                                }} />
                                                            </div>
                                                        </label>
                                                    ) : null}

                                                {setting.payment_setting.razorpay_payment_method === "1"
                                                    ? (
                                                        <label className="form-check-label" htmlFor='razorpay'>
                                                            <div className='payment-selector'>
                                                                <div className="">
                                                                    <img src={rozerpay} alt='cod' />
                                                                    <span>{t("razorpay")}</span>
                                                                </div>
                                                                <input type="radio" name="payment-method" id='razorpay' onChange={() => {
                                                                    setpaymentMethod("Razorpay");
                                                                }} />
                                                            </div>
                                                        </label>
                                                    ) : null}

                                                {setting.payment_setting.paystack_payment_method === "1"
                                                    ? (
                                                        <label className="form-check-label" htmlFor='paystack'>
                                                            <div className='payment-selector'>
                                                                <div className="">
                                                                    <img src={paystack} alt='cod' />
                                                                    <span>{t("paystack")}</span>
                                                                </div>
                                                                <input type="radio" name="payment-method" id='paystack' onChange={() => {
                                                                    setpaymentMethod("Paystack");
                                                                }} />
                                                            </div>
                                                        </label>
                                                    ) : null}

                                                {setting.payment_setting.stripe_payment_method === "1"
                                                    ? (
                                                        <label className="form-check-label" htmlFor='stripe'>
                                                            <div className='payment-selector'>
                                                                <div className="">
                                                                    <img src={Stripe} alt='stripe' />
                                                                    <span className='ps-2'> {t("stripe")}</span>
                                                                </div>
                                                                <input type="radio" name="payment-method" id='stripe' onChange={() => {
                                                                    setpaymentMethod("Stripe");
                                                                }} />
                                                            </div>
                                                        </label>
                                                    ) : null}

                                                {setting.payment_setting.paypal_payment_method === "1"
                                                    ? (
                                                        <>
                                                            <label className="form-check-label" htmlFor='paypal'>
                                                                <div className='payment-selector'>
                                                                    <div className="">
                                                                        <img src={paypal} alt='paypal' />
                                                                        <span>{t("paypal")}</span>
                                                                    </div>
                                                                    <input type="radio" name="payment-method" id='paypal' onChange={() => {
                                                                        setpaymentMethod("Paypal");
                                                                    }} />
                                                                </div>
                                                            </label>

                                                        </>
                                                    ) : null}


                                                {/* {console.log(cart)} */}
                                            </div>}


                                        <div className='order-summary-wrapper checkout-component'>

                                            <div className="order-bill">
                                                <div className='heading'>{t("order_summary")}</div>

                                                <div className='order-details'>
                                                    {cart.checkout === null || user.user === null
                                                        ? (
                                                            <Loader screen='full' />

                                                        )
                                                        : (
                                                            <div className='summary'>
                                                                <div className='d-flex justify-content-between'>
                                                                    <span>{t("sub_total")}</span>
                                                                    <div className='d-flex align-items-center'>

                                                                        <span>{setting.setting && setting.setting.currency}   {(cart.checkout.sub_total).toFixed(setting.setting && setting.setting.decimal_point)}</span>
                                                                    </div>
                                                                </div>

                                                                <div className='d-flex justify-content-between'>
                                                                    <span>{t("delivery_charge")}</span>
                                                                    <div className='d-flex align-items-center'>

                                                                        <span>{setting.setting && setting.setting.currency}  {(cart.checkout.delivery_charge.total_delivery_charge).toFixed(setting.setting && setting.setting.decimal_point)}</span>
                                                                    </div>
                                                                </div>
                                                                {cart.promo_code && <>
                                                                    <div className='d-flex justify-content-between'>
                                                                        <span>{t("discount")}</span>
                                                                        <div className='d-flex align-items-center'>

                                                                            <span>- {setting.setting && setting.setting.currency}    {Number(cart.promo_code?.discount).toFixed(setting.setting && setting.setting.decimal_point)}</span>
                                                                        </div>
                                                                    </div>
                                                                </>}
                                                                {walletDeductionAmt ? <>
                                                                    <div className='d-flex justify-content-between'>
                                                                        <span>{t("Wallet")}</span>
                                                                        <div className='d-flex align-items-center'>

                                                                            <span>- {setting.setting && setting.setting.currency}    {Number(walletDeductionAmt).toFixed(setting.setting && setting.setting.decimal_point)}</span>
                                                                        </div>
                                                                    </div>
                                                                </> : <></>}

                                                                {/* {cart.is_promocode_applied && cart.is_wallet_checked ? <>
                                                                    <div className='d-flex justify-content-between'>
                                                                        <span>{t("Wallet")}</span>
                                                                        <div className='d-flex align-items-center'>

                                                                            <span>- {setting.setting && setting.setting.currency}    {Number(cart.checkout?.total_amount - cart.promo_code?.discount).toFixed(setting.setting && setting.setting.decimal_point)}</span>
                                                                        </div>
                                                                    </div>
                                                                </> : !cart.is_promocode_applied && cart.is_wallet_checked ?
                                                                    (cart.checkout.user_balance < cart.checkout.total_amount) ? <>
                                                                        <div className='d-flex justify-content-between'>
                                                                            <span>{t("Wallet")}</span>
                                                                            <div className='d-flex align-items-center'>

                                                                                <span>- {setting.setting && setting.setting.currency}    {Number(cart.checkout.user_balance).toFixed(setting.setting && setting.setting.decimal_point)}</span>
                                                                            </div>
                                                                        </div>
                                                                    </> :
                                                                        <>
                                                                            <div className='d-flex justify-content-between'>
                                                                                <span>{t("Wallet")}</span>
                                                                                <div className='d-flex align-items-center'>

                                                                                    <span>- {setting.setting && setting.setting.currency}    {Number(cart.checkout.total_amount).toFixed(setting.setting && setting.setting.decimal_point)}</span>
                                                                                </div>
                                                                            </div>
                                                                        </> :
                                                                    <></>
                                                                } */}
                                                                {/* {cart.cart.data.user_balance && cart.is_wallet_checked && (cart.checkout.total_amount <= cart.checkout.user_balance) && !cart.promo_code ? <>
                                                                    <div className='d-flex justify-content-between'>
                                                                        <span>{t("Wallet")}</span>
                                                                        <div className='d-flex align-items-center'>

                                                                            <span>- {setting.setting && setting.setting.currency}    {Number(cart.checkout.total_amount).toFixed(setting.setting && setting.setting.decimal_point)}</span>
                                                                        </div>
                                                                    </div>
                                                                </> : cart.checkout.user_balance >= cart.checkout.total_amount && !cart.is_wallet_checked ? <> {null}

                                                                </>
                                                                    : cart.checkout.user_balance <= cart.checkout.total_amount && !cart.is_wallet_checked ? <>{null}</>
                                                                        : cart.is_wallet_checked && cart.promo_code && cart.promo_code.discount && (cart.promo_code.discount + cart.checkout.user_balance >= cart.checkout.total_amount) ? <>
                                                                            {null}
                                                                        </> : <>
                                                                            <div className='d-flex justify-content-between'>
                                                                                <span>{t("Wallet")}</span>
                                                                                <div className='d-flex align-items-center'>

                                                                                    <span>- {setting.setting && setting.setting.currency}    {Number(cart.checkout.total_amount).toFixed(setting.setting && setting.setting.decimal_point)}</span>
                                                                                </div>
                                                                            </div>
                                                                        </>
                                                                } */}
                                                                <div className='d-flex justify-content-between total'>
                                                                    <span>{t("total")}</span>
                                                                    <div className='d-flex align-items-center total-amount' style={{ color: "var(--secondary-color)" }}>
                                                                        <span>
                                                                            {setting.setting && setting.setting.currency}
                                                                            {Number(totalPayment).toFixed(setting.setting && setting.setting.decimal_point)}
                                                                        </span>
                                                                        {/* {cart.promo_code ?
                                                                            <span>
                                                                                {setting.setting && setting.setting.currency}
                                                                                {(cart.promo_code.discounted_amount + cart.checkout.delivery_charge.total_delivery_charge).toFixed(setting.setting && setting.setting.decimal_point)}
                                                                            </span>
                                                                            : <>
                                                                                <span>{
                                                                                    setting.setting && setting.setting.currency}
                                                                                    {(cart.checkout.total_amount).toFixed(setting.setting && setting.setting.decimal_point)}
                                                                                </span>
                                                                            </>} */}
                                                                    </div>
                                                                </div>




                                                                {loadingPlaceOrder
                                                                    ?
                                                                    <Loader screen='full' background='none' />
                                                                    : <>
                                                                        {
                                                                            setting.payment_setting.cod_payment_method === "1" && codAllow == '1' ||
                                                                                setting.payment_setting.razorpay_payment_method === "1" ||
                                                                                setting.payment_setting.paystack_payment_method === "1" ||
                                                                                setting.payment_setting.stripe_payment_method === "1" ||
                                                                                setting.payment_setting.paypal_payment_method === "1" ? (

                                                                                <div className='button-container'>



                                                                                    {paymentMethod === "Stripe" && setting
                                                                                        ? <motion.button whileTap={{ scale: 0.8 }} type='button' className='checkout' onClick={(e) => { e.preventDefault(); HandlePlaceOrder(); }}>{t("place_order")}</motion.button>
                                                                                        : <motion.button whileTap={{ scale: 0.8 }} type='button' className='checkout' onClick={(e) => { e.preventDefault(); HandlePlaceOrder(); }}>{t("place_order")}</motion.button>
                                                                                    }
                                                                                </div>
                                                                            ) : null
                                                                        }
                                                                    </>
                                                                }

                                                            </div>)}
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </>
                        )
                }


                <Promo show={showPromoOffcanvas} setShow={setShowPromoOffcanvas} />

            </section>
            <Modal id="stripeModal" size='lg' centered show={stripeModalShow}>
                <Modal.Header onClick={() => setStripeModalShow(false)

                } className='header justify-content-between'>
                    <span style={{ color: '#33a36b', fontSize: '18px', fontWeight: 'bolder' }}>Egrocers Payment</span>
                    <span style={{ cursor: 'pointer' }}>
                        <AiOutlineCloseCircle size={20} />
                    </span>

                </Modal.Header>
                <Modal.Body>

                    {stripeOrderId === null || stripeClientSecret === null || stripeTransactionId === null
                        ? <Loader width='100%' height='100%' />
                        :
                        <Elements stripe={stripePromise} orderID={stripeOrderId} client_secret={stripeClientSecret} transaction_id={stripeTransactionId} amount={totalPayment}>
                            <InjectCheckout setShow={setStripeModalShow} orderID={stripeOrderId} client_secret={stripeClientSecret} transaction_id={stripeTransactionId} amount={totalPayment}
                                setWalletAmount={setWalletAmount} walletAmount={user?.user?.balance}
                                walletDeductionAmt={walletDeductionAmt}
                            />
                        </Elements>
                    }

                </Modal.Body>
            </Modal>
        </>
    );
};

export default Checkout;
