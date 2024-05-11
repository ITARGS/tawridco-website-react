import React, { useEffect, useState } from 'react';
import './cart.css';
import { useSelector, useDispatch } from 'react-redux';
import { BsPlus } from "react-icons/bs";
import { BiMinus } from 'react-icons/bi';
import api from '../../api/api';
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';
import { ActionTypes } from '../../model/action-type';
import EmptyCart from '../../utils/zero-state-screens/Empty_Cart.svg';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import coverImg from '../../utils/cover-img.jpg';
import { RiCoupon2Fill, RiDeleteBinLine } from 'react-icons/ri';
import Loader from '../loader/Loader';
import Promo from './Promo';
import { useTranslation } from 'react-i18next';
import { setProductSizes } from '../../model/reducer/productSizesReducer';
import { clearCartPromo, setCart, setCartCheckout, setCartProducts, setCartPromo, setCartSubTotal, setPromoCodeApplied } from '../../model/reducer/cartReducer';


const ViewCart = () => {


    const dispatch = useDispatch();
    const cookies = new Cookies();
    const navigate = useNavigate();

    const cart = useSelector(state => (state.cart));
    const city = useSelector(state => (state.city));
    const user = useSelector(state => (state.user));
    const location = useLocation();
    const sizes = useSelector(state => (state.productSizes));
    const setting = useSelector(state => (state.setting));
    const cartItems = cart?.cart?.data;
    const [productSizes, setproductSizes] = useState(null);
    const [iscartEmpty, setiscartEmpty] = useState(false);
    const [isLoader, setisLoader] = useState(false);
    const [showPromoOffcanvas, setShowPromoOffcanvas] = useState(false);
    const [cartProducts, setViewCartProducts] = useState([]);

    console.log(location.pathname);
    useEffect(() => {
        if (location.pathname == "/cart")
            api.getCart(cookies.get('jwt_token'), city.city.latitude, city.city.longitude, 0)
                .then(response => response.json())
                .then(result => {
                    if (result.status === 1) {
                        // dispatch(setCartCheckout({ data: result.data }));
                        console.log(result.data);
                        dispatch(setCart({ data: result }));
                        setViewCartProducts(result?.data?.cart);
                        const productsData = result?.data?.cart?.map((product) => {
                            return {
                                product_id: product?.product_id,
                                product_variant_id: product?.product_variant_id,
                                qty: product?.qty
                            };
                        });
                        dispatch(setCart({ data: result }));
                        dispatch(setCartSubTotal({ data: result?.data?.sub_total }));
                        dispatch(setCartProducts({ data: productsData }));
                        // dispatch({ type: ActionTypes.SET_CART_CHECKOUT, payload: result.data });
                    }

                })
                .catch(error => console.log(error));

    }, [user]);

    useEffect(() => {
        if (cart?.cartProducts?.length == 0) {
            setiscartEmpty(true);
        }
    }, [cart?.cartProducts]);

    //Add to Cart
    const addtoCart = async (product_id, product_variant_id, qty) => {
        // setisLoader(true);

        await api.addToCart(cookies.get('jwt_token'), product_id, product_variant_id, qty)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    toast.success(result.message);
                    dispatch(clearCartPromo());
                    dispatch(setCartSubTotal({ data: result?.sub_total ? result?.sub_total : 0 }));
                    const updatedCartProducts = cartProducts?.map(product => {
                        if ((product.product_id == product_id) && (product?.product_variant_id == product_variant_id)) {
                            return { ...product, qty: qty };
                        } else {
                            return product;
                        }
                    });
                    setViewCartProducts(updatedCartProducts);
                    const updatedProducts = cart?.cartProducts?.map((product) => {
                        if ((product?.product_id == product_id) && (product?.product_variant_id == product_variant_id)) {
                            return { ...product, qty: qty };
                        } else {
                            return product;
                        }
                    });
                    dispatch(setCartProducts({ data: updatedProducts }));
                }
                else {
                    // setisLoader(false);
                    toast.error(result.message);
                }
            });
        // setisLoader(false);

    };

    //remove from Cart
    const removefromCart = async (product_id, product_variant_id) => {
        // setisLoader(true);
        await api.removeFromCart(cookies.get('jwt_token'), product_id, product_variant_id)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    toast.success(result.message);
                    // await api.getCart(cookies.get('jwt_token'), city.city.latitude, city.city.longitude)
                    //     .then(resp => resp.json())
                    //     .then(res => {
                    //         setisLoader(false);
                    //         dispatch(clearCartPromo());
                    //         // dispatch(setPromoCodeApplied({ data: 0 }));
                    //         if (res.status === 1) {
                    //             dispatch(dispatch(setCart({ data: res })));
                    //         }
                    //         else {
                    //             setiscartEmpty(true);
                    //             dispatch(setCart({ data: null }));
                    //         }
                    //     })
                    //     .catch(error => console.log(error));
                    dispatch(clearCartPromo());
                    const updatedCartProducts = cart?.cartProducts?.filter(product => {
                        if (product?.product_variant_id != product_variant_id) {
                            return product;
                        }
                    });
                    dispatch(setCartProducts({ data: updatedCartProducts ? updatedCartProducts : [] }));
                    dispatch(setCartSubTotal({ data: result?.sub_total }));
                    const updatedProducts = cartProducts?.filter(product => {
                        if (product.product_variant_id != product_variant_id) {
                            return product;
                        }
                    });
                    setViewCartProducts(updatedProducts);
                }
                else {
                    // setisLoader(false);
                    toast.error(result.message);
                }
            })
            .catch(error => console.log(error));
    };
    const { t } = useTranslation();
    const placeHolderImage = (e) => {

        e.target.src = setting.setting?.web_logo;
    };

    const stockValidation = () => {
        cart.cart?.data?.cart.forEach(element => {
            if (!element.status) {
                return () => {
                    toast.error(t('some_items_are_out_of_stock'));
                };
            }
            navigate('/checkout');
        });
    };
    console.log(cartProducts);
    return (
        <section id='viewcart' className='viewcart'>
            <div className='cover'>
                <img src={coverImg} onError={placeHolderImage} className='img-fluid' alt="cover"></img>
                <div className='title'>
                    <h3>{t("cart")}</h3>
                    <span><Link to='/' className='text-light text-decoration-none'>{t("home")} / </Link></span><span className='active'>{t('cart')}</span>
                </div>

            </div>

            <div className="view-cart-container">
                <div className='container'>

                    {iscartEmpty ? (
                        <div className='empty-cart co-12'>
                            <img src={EmptyCart} onError={placeHolderImage} alt='empty-cart'></img>
                            <p>{t("empty_cart_list_message")}</p>
                            <span>{t("empty_cart_list_description")}</span>
                            <button type='button' onClick={() => {
                                navigate('/products');
                            }}>{t("empty_cart_list_button_name")}</button>
                        </div>) : (
                        <>
                            <>
                                {isLoader ? <Loader screen='full' background='none' /> : null}
                                <div className="row">

                                    <div className='viewcart-product-wrapper col-8'>
                                        <div className='product-heading'>
                                            <h3>{t("your_cart")}</h3>
                                            <span>{t("there_are")} </span><span className='title'>{cart?.cartProducts?.length}</span> <span> {t("product_in_your_cart")}  </span>
                                        </div>

                                        <table className='products-table table'>
                                            <thead>
                                                <tr>
                                                    <th className='first-column'>{t("product")}</th>
                                                    <th className='hide-mobile'>{t("unit")}</th>
                                                    <th>{t("price")}</th>
                                                    <th>{("quantity")}</th>
                                                    <th className='hide-mobile'>{t("sub_total")}</th>
                                                    <th className='last-column'>{t("remove")}</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {cartProducts?.map((product, index) => {
                                                    if (cart?.cartProducts?.find((prdct) => prdct?.product_variant_id == product?.product_variant_id)?.qty > 0) {
                                                        return (
                                                            <tr key={index} className={`${!product.status ? "danger" : ""}`}>
                                                                <th className='products-image-container first-column'>
                                                                    <div className='image-container'>
                                                                        <img onError={placeHolderImage} src={product.image_url} alt='product'></img>
                                                                    </div>

                                                                    <div className=''>
                                                                        <span>{product.measurement} {product.unit} | {product.name}</span>

                                                                    </div>
                                                                </th>

                                                                <th className='unit hide-mobile'>
                                                                    {product.qty}
                                                                </th>

                                                                <th className='price'>
                                                                    {setting.setting && setting.setting.currency}
                                                                    {(product.discounted_price === 0 ? product.price.toFixed(setting.setting && setting.setting.decimal_point) : product.discounted_price.toFixed(setting.setting && setting.setting.decimal_point))}
                                                                </th>

                                                                <th className='quantity'>
                                                                    <div>
                                                                        <button type='button' onClick={() => {

                                                                            if (product.qty > 1) {
                                                                                addtoCart(product.product_id, product.product_variant_id, product.qty - 1);
                                                                            }

                                                                        }}><BiMinus fill='#fff' fontSize={'2rem'} /></button>
                                                                        <span >{product.qty}</span>
                                                                        <button type='button' onClick={() => {
                                                                            if (Number(product.is_unlimited_stock) === 1) {
                                                                                if (Number(product.qty) < Number(setting.setting.max_cart_items_count)) {
                                                                                    addtoCart(product.product_id, product.product_variant_id, product.qty + 1);
                                                                                } else {
                                                                                    toast.error('Apologies, maximum product quantity limit reached!');
                                                                                }
                                                                            } else {
                                                                                if (Number(product.qty) >= Number(product.stock)) {
                                                                                    toast.error(t("out_of_stock_message"));

                                                                                } else if (Number(product.qty) >= Number(setting.setting.max_cart_items_count)) {
                                                                                    toast.error('Apologies, maximum product quantity limit reached!');
                                                                                }
                                                                                else {
                                                                                    addtoCart(product.product_id, product.product_variant_id, product.qty + 1);
                                                                                }
                                                                            }
                                                                        }}><BsPlus fill='#fff' fontSize={'2rem'} /></button>
                                                                    </div>

                                                                </th>

                                                                <th className='subtotal hide-mobile'>
                                                                    {setting.setting && setting.setting.currency}

                                                                    {((product.discounted_price === 0 ? product.price.toFixed(setting.setting?.decimal_point) : product.discounted_price.toFixed(setting.setting && setting.setting.decimal_point)) * product.qty).toFixed(setting.setting && setting.setting.decimal_point)}
                                                                </th>

                                                                <th className='remove last-column'>
                                                                    <button whiletap={{ scale: 0.8 }} type='button' onClick={() => removefromCart(product.product_id, product.product_variant_id)}>
                                                                        <RiDeleteBinLine fill='red' fontSize={'2.985rem'} />
                                                                    </button>
                                                                </th>
                                                            </tr>
                                                        );
                                                    }
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="billing col-3">
                                        <div className="promo-section mb-3">

                                            <div className="heading">
                                                <span>{t("coupon")}</span>
                                            </div>
                                            <div className="promo-wrapper">
                                                <div className="promo-container">
                                                    <div className="promo-button ">
                                                        <span className="">{t("have_coupon")}</span>
                                                        <button className="btn" onClick={() => setShowPromoOffcanvas(true)}>{t("view_coupon")}</button>
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
                                                                    <span>{setting.setting && setting.setting.currency} {cart.promo_code.discount.toFixed(setting.setting && setting.setting.decimal_point)}</span>
                                                                    <span className='promo-remove' onClick={() => {
                                                                        dispatch(clearCartPromo());
                                                                        toast.info("Coupon Removed");
                                                                    }}> {t("remove")}</span>
                                                                </div>
                                                            </div>
                                                        </>
                                                        : <></>}
                                                </div>
                                            </div>

                                        </div>
                                        <div className='cart-summary-wrapper'>
                                            <div className='heading'>
                                                <span >{t("cart")} {t("total")}</span>
                                            </div>
                                            {cart.cartSubTotal === null
                                                ? (<div className="d-flex justify-content-center">
                                                    <div className="spinner-border" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                </div>)
                                                : (
                                                    <div className='summary'>
                                                        <div className='d-flex justify-content-between'>
                                                            <span>{t("sub_total")}</span>
                                                            <div className='d-flex align-items-center'>
                                                                {setting.setting && setting.setting.currency}
                                                                <span>{(cart?.cartSubTotal)?.toFixed(setting.setting && setting.setting.decimal_point)}</span>
                                                            </div>
                                                        </div>

                                                        {/* <div className='d-flex justify-content-between'>
                                                            <span>{t("delivery_charge")}</span>
                                                            <div className='d-flex align-items-center'>
                                                                {setting.setting && setting.setting.currency}
                                                                <span>{(cart?.checkout?.delivery_charge?.total_delivery_charge)?.toFixed(setting.setting && setting.setting.decimal_point)}</span>
                                                            </div>
                                                        </div> */}
                                                        {cart.promo_code && <>
                                                            <div className='d-flex justify-content-between'>
                                                                <span>{t("discount")}</span>
                                                                <div className='d-flex align-items-center'>

                                                                    <span>-   {setting.setting && setting.setting.currency}{(cart?.promo_code.discount)?.toFixed(setting.setting && setting.setting.decimal_point)}</span>
                                                                </div>
                                                            </div>
                                                        </>}

                                                        {/* <div className='d-flex justify-content-between total'>
                                                            <span>{t("total")}</span>
                                                            <div className='d-flex align-items-center total-amount'>
                                                                {setting.setting && setting.setting.currency}
                                                                {cart.promo_code ?
                                                                    <span>{(cart?.promo_code?.discounted_amount + cart?.checkout?.delivery_charge?.total_delivery_charge)?.toFixed(setting.setting && setting.setting.decimal_point)}</span>
                                                                    : <>
                                                                        <span>{cart?.checkout?.total_amount?.toFixed(setting.setting && setting.setting.decimal_point)}</span>
                                                                    </>}
                                                            </div>
                                                        </div> */}


                                                        <div className='d-flex justify-content-center mt-3 button-container'>
                                                            <button type='button' style={{ cursor: "pointer" }} onClick={stockValidation} className='checkout'>{t("proceed_to_checkout")}</button>
                                                        </div>

                                                    </div>)}
                                        </div>
                                    </div>
                                </div>
                            </>
                        </>
                    )}
                </div>
            </div>
            <Promo show={showPromoOffcanvas} setShow={setShowPromoOffcanvas} />
        </section>

    );
};

export default ViewCart;
