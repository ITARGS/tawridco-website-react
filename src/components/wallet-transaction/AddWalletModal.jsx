import React, { useCallback, useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import "./add-wallet-money.css";
import PaypalSVG from "../../utils/Paypal.svg";
import PayStackSVG from "../../utils/Paystack.svg";
import RazorPaySVG from "../../utils/Razorpay.svg";
import StripeSVG from "../../utils/Stripe.svg";
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
    console.log(walletAmount);
    const handleAmountChange = (e) => {
        setWalletAmount(e.target.value);
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
                console.log(res);
                if (res.razorpay_payment_id) {
                    await api.addTransaction(cookies.get('jwt_token'), null, razorpay_transaction_id, "Razorpay", "wallet", amount)
                        .then(response => response.json())
                        .then(result => {
                            console.log(result);
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
            oncancel: async (res) => {
                // handleRazorpayCancel(order_id);

            },
            modal: {
                confirm_close: true,
                ondismiss: async (reason) => {
                    if (reason === undefined) {
                        // handleRazorpayCancel(order_id);
                        // dispatch(deductUserBalance({ data: walletDeductionAmt ? walletDeductionAmt : 0 }));
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
            // handleRazorpayCancel(order_id);
        });
        rzpay.on('payment.failed', function (response) {
            // api.deleteOrder(cookies.get('jwt_token'), order_id);
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
            onClose: function () {
                // api.deleteOrder(cookies.get('jwt_token'), orderid);
                // setWalletAmount(user.user.balance);
                // dispatch(setWallet({ data: 0 }));
            },
            callback: async function (response) {
                console.log(response);
                await api.addTransaction(cookies.get('jwt_token'), null, response.reference, paymentMethod, "wallet", amount)
                    .then(response => response.json())
                    .then(result => {
                        if (result.status === 1) {
                            console.log(result);
                            toast.success(result.message);
                            dispatch(addUserBalance({ data: parseInt(amount) }));
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.initiate_transaction(cookies.get("jwt_token"), null, paymentMethod, "wallet", walletAmount);
            const result = await response.json();
            if (paymentMethod === "razorpay") {
                handleRazorpayPayment(result?.data?.transaction_id, walletAmount, user?.user?.name, user?.user?.email, user?.user?.mobile, setting.setting?.app_name);
            } else if (paymentMethod === "paystack") {
                handlePayStackPayment(user?.user?.email, walletAmount, setting.payment_setting.paystack_currency_code, setting.setting.support_email);
            } else if (paymentMethod === "stripe") {
                setStripeTransId(result.data?.id);
                setstripeClientSecret(result.data?.client_secret);
                setStripeModalShow(true);
            }
            setWalletAmount(0);
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
                                                <img className='me-2' src={PaypalSVG} alt='paypalSVG' />
                                                {t("paypal")}
                                            </div>
                                            <div>
                                                <input type='radio' id='paymentRadioBtn' name='paymentRadioBtn' onChange={() => handlePmtMethodChange("paypal")} />
                                            </div>
                                        </div>
                                        <div className='d-flex flex-row justify-content-between align-items-center paymentContainer'>
                                            <div>

                                                <img className='me-2' src={RazorPaySVG} alt='razorPaySVG' />
                                                {t("razorpay")}
                                            </div>
                                            <div>
                                                <input type='radio' id='paymentRadioBtn' name='paymentRadioBtn' onChange={() => handlePmtMethodChange("razorpay")} />
                                            </div>
                                        </div>
                                        <div className='d-flex flex-row justify-content-between align-items-center paymentContainer'>
                                            <div>

                                                <img className='me-2' src={PayStackSVG} alt='paystackSVG' />
                                                {t("paystack")}
                                            </div>
                                            <div>
                                                <input type='radio' id='paymentRadioBtn' name='paymentRadioBtn' onChange={() => handlePmtMethodChange("paystack")} />
                                            </div>
                                        </div>
                                        <div className='d-flex flex-row justify-content-between align-items-center paymentContainer'>
                                            <div>
                                                <img className='me-2' src={StripeSVG} alt='stripeSVG' />
                                                {t("stripe")}
                                            </div>
                                            <div>
                                                <input type='radio' id='paymentRadioBtn' name='paymentRadioBtn' onChange={() => handlePmtMethodChange("stripe")} />
                                            </div>
                                        </div>
                                        <div className='d-flex flex-row justify-content-between align-items-center paymentContainer'>
                                            <div>
                                                <img className='me-2' src={PaytmSVG} alt='paytmSVG' />
                                                {t("Paytm")}
                                            </div>
                                            <div>
                                                <input type='radio' id='paymentRadioBtn' name='paymentRadioBtn' onChange={() => handlePmtMethodChange("paytm")} />
                                            </div>
                                        </div>

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
                        <Elements stripe={stripePromise} client_secret={stripeClientSecret} transaction_id={stripeTransId}>
                            <ElementsConsumer client_secret={stripeClientSecret} transaction_id={stripeTransId} amount={walletAmount}>
                                {({ stripe, elements, orderID, client_secret, transaction_id, amount }) => (
                                    <>
                                        <StripeModal stripe={stripe}
                                            setShow={setStripeModalShow}
                                            elements={elements}
                                            client_secret={stripeClientSecret}
                                            transaction_id={stripeTransId}
                                            walletAmount={parseInt(walletAmount)}
                                        />
                                    </>
                                )}
                            </ElementsConsumer>
                        </Elements>
                    }

                </Modal.Body>
            </Modal>
        </>

    );
};
const CARD_OPTIONS = {
    iconStyle: "solid",
    style: {
        base: {
            // iconColor: "#c4f0ff",
            fontWeight: 500,
            fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
            fontSize: "16px",
            fontSmoothing: "antialiased",
            ":-webkit-autofill": { color: "#fce883" },
            "::placeholder": { color: "#87bbfd" },
            border: "2px solid black"
        },
        invalid: {
            // iconColor: "#ffc7ee",
            color: "#ffc7ee"
        }
    }
};
const StripeModal = (props) => {
    console.log(props);
    const cookies = new Cookies();
    const navigate = useNavigate();

    const dispatch = useDispatch();


    const user = useSelector((state) => state.user);

    const [loadingPay, setloadingPay] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const { stripe, elements, transaction_id } = props;

        setloadingPay(true);
        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            setloadingPay(false);
            // props.setShow(false)
            return;
        }

        if (!transaction_id) {
            setloadingPay(false);
            props.setShow(false);
            return;
        }



        const SK = props.client_secret;

        // Confirm the PaymentIntent with the Payment Element
        const { paymentIntent, error } = await stripe.confirmCardPayment(SK, {
            payment_method: {
                card: elements.getElement(CardElement),
                billing_details: {
                    name: user.user && user.user.name,
                    address: {
                        line1: '510 Townsend St',
                        postal_code: '98140',
                        city: 'San Francisco',
                        state: 'CA',
                        country: 'US',
                    },

                },
            },
        },);
        if (error) {
            // console.log(error.message);
            // api.deleteOrder(cookies.get('jwt_token'), orderID);
            toast.error(error.message);
            props.setWalletAmount(props.walletAmount);
            props.setShow(false);

        } else if (paymentIntent.status === 'succeeded') {
            // Redirect the customer to a success page
            // window.location.href = '/success';
            // props.setShow(false)
            await api.addTransaction(cookies.get('jwt_token'), null, props.transaction_id, "Stripe", "wallet", props.walletAmount)
                .then(response => response.json())
                .then(result => {
                    if (result.status === 1) {
                        setShow(true);
                        setIsOrderPlaced(true);
                        setloadingPay(false);
                    }
                    else {
                        setloadingPay(false);
                    }
                    // closeModal.current.click()
                })
                .catch(error => console.log(error));
            props.setShow(false);
            // setTimeout(() => {
            //     navigate("/");
            // }, 4000);
        } else {
            // Handle other payment status scenarios
            // api.deleteOrder(cookies.get('jwt_token'), orderID);
            setloadingPay(false);
            console.log('Payment failed');
            props.setShow(false);
            setIsOrderPlaced(false);
        }
    };

    const [isOrderPlaced, setIsOrderPlaced] = useState(false);
    const [show, setShow] = useState(false);

    return (
        <>
            <div className="modal-body">

                <div className='stripe-container d-flex flex-column p-0'>

                    {/* <div className="d-flex flex-row justify-content-between header">
                        <span className='heading'>Egrocers Payment</span>
                        <button type="button" className="close-stripe" data-bs-dismiss="modal" aria-label="Close" ref={closeModal}><AiOutlineCloseCircle /></button>
                    </div> */}
                    <form onSubmit={handleSubmit} id="stripe-form" className='row p-5 border-3'>
                        {/* <CardSection /> */}
                        <fieldset className='FormGroup p-4'>
                            <div className="FormRow">

                                <CardElement options={CARD_OPTIONS} />
                            </div>
                        </fieldset>
                        {loadingPay
                            ? <Loader screen='full' background='none' />
                            :
                            <button whiletap={{ scale: 0.8 }} type='submit' disabled={!props.stripe} className='pay-stripe'>Pay</button>
                        }
                    </form>
                </div>

            </div>
        </>
    );
};
export default AddWalletModal;