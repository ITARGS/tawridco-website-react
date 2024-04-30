import React, { useCallback, useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import "./add-wallet-money.css";
import PaypalSVG from "../../utils/Paypal.svg";
import PayStackSVG from "../../utils/Paystack.svg";
import RazorPaySVG from "../../utils/Razorpay.svg";
import StripeSVG from "../../utils/Stripe.svg";
import MidtransSVG from "../../utils/Icons/Midtrans.svg";
import PaytmSVG from "../../utils/Paytm.svg";
import api from '../../api/api';
import Cookies from 'universal-cookie';
import useRazorpay from 'react-razorpay';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from "react-toastify";
import { addUserBalance } from '../../model/reducer/authReducer';
import PaystackPop from '@paystack/inline-js';
import { CardElement, Elements, ElementsConsumer } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import Loader from '../loader/Loader';
import { loadStripe } from '@stripe/stripe-js';
import InjectCheckout from './AddWalletStripeModal';

const AddWalletModal = (props) => {
    const cookies = new Cookies();
    const { t } = useTranslation();

    const setting = useSelector(state => state.setting);
    const user = useSelector(state => state.user);
    const dispatch = useDispatch();

    const [walletAmount, setWalletAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("Paypal");
    const [stripeTransId, setStripeTransId] = useState(null);
    const [stripeClientSecret, setstripeClientSecret] = useState(null);
    const [stripeModalShow, setStripeModalShow] = useState(false);
    const handleAmountChange = (e) => {
        const amt = parseInt(e.target.value);
        setWalletAmount(amt);
    };

    const handlePmtMethodChange = (value) => {
        setPaymentMethod(value);
    };


    const stripePromise = loadStripe(setting.payment_setting && setting.payment_setting.stripe_publishable_key);


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

    const [Razorpay] = useRazorpay();

    const handleRazorpayPayment = useCallback(async (razorpay_transaction_id, amount, name, email, mobile, app_name) => {
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
                // console.log(res);
                if (res.razorpay_payment_id) {
                    await api.addTransaction(cookies.get('jwt_token'), null, razorpay_transaction_id, "Razorpay", "wallet", amount)
                        .then(response => response.json())
                        .then(result => {
                            // console.log(result);
                            if (result.status === 1) {
                                props.setShowModal(false);
                                toast.success(result.message);
                                dispatch(addUserBalance({ data: parseInt(amount) }));
                            }
                            else {
                                toast.error(result.message);
                            }
                        })
                        .catch(error => console.log(error));
                }


            },
            modal: {
                confirm_close: true,
                ondismiss: async (reason) => {
                    if (reason === undefined) {
                        props.setShowModal(false);
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
            toast.error(response);
            props.setShowModal(false);
        });
        rzpay.on('payment.failed', function (response) {
            toast.error(response);
        });
        rzpay.open();
    }, [Razorpay]);

    const handlePayStackPayment = (email, amount, currency, support_email, orderid) => {
        let handler = PaystackPop.setup({
            key: setting.payment_setting && setting.payment_setting.paystack_public_key,
            email: email,
            amount: parseFloat(amount) * 100,
            currency: currency,
            ref: (new Date()).getTime().toString(),
            label: support_email,
            callback: async function (response) {
                await api.addTransaction(cookies.get('jwt_token'), null, response.reference, "Paystack", "wallet", amount)
                    .then(response => response.json())
                    .then(result => {
                        if (result.status === 1) {
                            toast.success(result.message);
                            dispatch(addUserBalance({ data: parseInt(amount) }));
                            props.setShowModal(false);
                        }
                        else {
                            toast.error(result.message);
                            props.setShowModal(false);
                        }
                    })
                    .catch(error => console.log(error));
            }
        });

        handler.openIframe();
    };
    const handlePaypalPayment = async (redirectUrl) => {
        const newWindow = window.open(redirectUrl, "_parent");
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response, result;
            if (paymentMethod === "paypal" || paymentMethod === "stripe" || paymentMethod === "razorpay" || paymentMethod === "midtrans") {
                response = await api.initiate_transaction(cookies.get("jwt_token"), null, paymentMethod, "wallet", walletAmount);
                result = await response.json();
            }
            if (paymentMethod === "razorpay") {
                handleRazorpayPayment(result?.data?.transaction_id, walletAmount, user?.user?.name, user?.user?.email, user?.user?.mobile, setting.setting?.app_name);
            } else if (paymentMethod === "paystack") {
                handlePayStackPayment(user?.user?.email, walletAmount, setting.payment_setting.paystack_currency_code, setting.setting.support_email);
            } else if (paymentMethod === "stripe") {
                setStripeTransId(result.data?.id);
                setstripeClientSecret(result.data?.client_secret);
                setStripeModalShow(true);
            } else if (paymentMethod === "paypal") {
                handlePaypalPayment(result?.data?.paypal_redirect_url);
            } else if (paymentMethod === "midtrans") {
                window.open(result?.data?.snapUrl, "_blank");
            }
        } catch (err) {
            console.log(err.message);
        }
    };
    return (
        <>

            <Modal
                className='addMoneyToWalletModal'
                size='md'
                centered
                show={props.showModal}
                backdrop={"static"}
            >
                <Modal.Header className='d-flex justify-content-between'>
                    <div className='fw-bold modalHeading'>
                        {t("add_to_wallet")}
                    </div>
                    <div className='closeModalBtn' onClick={() => props.setShowModal(false)}><AiOutlineCloseCircle size={34} /></div>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleSubmit}>
                        <div className='d-flex flex-column justify-content-start'>
                            <div>
                                <div className='mb-3'>{t("amount")}</div>
                                <div className='w-100 mb-5'>
                                    <input
                                        type='number'
                                        required
                                        className='moneyAmountPlaceholder w-100 text-start'
                                        placeholder={t("type_amount")}
                                        onChange={handleAmountChange} />
                                </div>
                                <div>
                                    <div className='mb-4'>
                                        {t("choose_payment_method")}
                                    </div>
                                    <div className='d-flex flex-column gap-4'>
                                        <div className='d-flex flex-row justify-content-between align-items-center paymentContainer'>
                                            <div>
                                                <img className='me-3' src={PaypalSVG} alt='paypalSVG' />
                                                {t("paypal")}
                                            </div>
                                            <div>
                                                <input type='radio' id='paymentRadioBtn' name='paymentRadioBtn' onChange={() => handlePmtMethodChange("paypal")} />
                                            </div>
                                        </div>
                                        <div className='d-flex flex-row justify-content-between align-items-center paymentContainer'>
                                            <div>

                                                <img className='me-3' src={RazorPaySVG} alt='razorPaySVG' />
                                                {t("razorpay")}
                                            </div>
                                            <div>
                                                <input type='radio' id='paymentRadioBtn' name='paymentRadioBtn' onChange={() => handlePmtMethodChange("razorpay")} />
                                            </div>
                                        </div>
                                        <div className='d-flex flex-row justify-content-between align-items-center paymentContainer'>
                                            <div>

                                                <img className='me-3' src={PayStackSVG} alt='paystackSVG' />
                                                {t("paystack")}
                                            </div>
                                            <div>
                                                <input type='radio' id='paymentRadioBtn' name='paymentRadioBtn' onChange={() => handlePmtMethodChange("paystack")} />
                                            </div>
                                        </div>
                                        <div className='d-flex flex-row justify-content-between align-items-center paymentContainer'>
                                            <div>
                                                <img className='me-3' src={StripeSVG} alt='stripeSVG' />
                                                {t("stripe")}
                                            </div>
                                            <div>
                                                <input type='radio' id='paymentRadioBtn' name='paymentRadioBtn' onChange={() => handlePmtMethodChange("stripe")} />
                                            </div>
                                        </div>
                                        <div className='d-flex flex-row justify-content-between align-items-center paymentContainer'>
                                            <div>
                                                <img className='MidtransSVG me-3' src={MidtransSVG} alt='MidtransSVG' />
                                                {t("midtrans")}
                                            </div>
                                            <div>
                                                <input type='radio' id='paymentRadioBtn' name='paymentRadioBtn' onChange={() => handlePmtMethodChange("midtrans")} />
                                            </div>
                                        </div>
                                        {/* <div className='d-flex flex-row justify-content-between align-items-center paymentContainer'>
                                            <div>
                                                <img className='me-2' src={PaytmSVG} alt='paytmSVG' />
                                                {t("Paytm")}
                                            </div>
                                            <div>
                                                <input type='radio' id='paymentRadioBtn' name='paymentRadioBtn' onChange={() => handlePmtMethodChange("paytm")} />
                                            </div>
                                        </div> */}

                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className='d-flex justify-content-end'>
                            <button type='submit' className='payButton'>{t("add_money")}</button>
                        </div>
                    </form>

                </Modal.Body>
            </Modal>
            <Modal id="stripeModal" size='lg' centered show={stripeModalShow}>
                <Modal.Header onClick={() => setStripeModalShow(false)

                } className='header justify-content-between'>
                    <span style={{ color: '#33a36b', fontSize: '18px', fontWeight: 'bolder' }}>Egrocers Payment</span>
                    <span style={{ cursor: 'pointer' }}>
                        <AiOutlineCloseCircle size={20} />
                    </span>

                </Modal.Header>
                <Modal.Body>

                    {stripeClientSecret === null || stripeTransId === null
                        ? <Loader width='100%' height='100%' />
                        :
                        <Elements stripe={stripePromise} client_secret={stripeClientSecret} transaction_id={stripeTransId} amount={walletAmount}>
                            <InjectCheckout setAddWalletModal={props.setShowModal} setShow={setStripeModalShow} stripe={stripePromise} client_secret={stripeClientSecret} transaction_id={stripeTransId} amount={walletAmount} />
                        </Elements>
                    }

                </Modal.Body>
            </Modal>
        </>

    );
};


export default AddWalletModal;