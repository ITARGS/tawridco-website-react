import React, { useEffect, useState, useRef, } from 'react';
import './cart.css';
import { useSelector, useDispatch } from 'react-redux';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { BsPlus } from "react-icons/bs";
import { BiMinus } from 'react-icons/bi';
import api from '../../api/api';
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';
import { ActionTypes } from '../../model/action-type';
import EmptyCart from '../../utils/zero-state-screens/Empty_Cart.svg';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../loader/Loader';
import { useTranslation } from 'react-i18next';
import { setProductSizes } from "../../model/reducer/productSizesReducer";
import { clearCartPromo, setCart, setCartProducts, setPromoCodeApplied, setCartSubTotal } from "../../model/reducer/cartReducer";
import Promo from "./Promo";
import { RiCoupon2Fill } from 'react-icons/ri';



const Cart = ({ isCartSidebarOpen, setIsCartSidebarOpen }) => {

    const closeCanvas = useRef();
    const cookies = new Cookies();
    const dispatch = useDispatch();
    const navigate = useNavigate();


    const cart = useSelector(state => (state.cart));
    const city = useSelector(state => (state.city));
    const sizes = useSelector(state => (state.productSizes));
    const setting = useSelector(state => (state.setting));

    const [productSizes, setproductSizes] = useState(null);
    const [iscartEmpty, setiscartEmpty] = useState(false);
    const [isLoader, setisLoader] = useState(false);
    const [showPromoOffcanvas, setShowPromoOffcanvas] = useState(false);
    const [cartSidebarData, setCartSidebarData] = useState([]);
    // const [cartSubTotal, setCartSubTotal] = useState(0);
    useEffect(() => {
        if (sizes.sizes === null || sizes.status === 'loading') {
            if (city.city !== null && cart.cart !== null) {
                api.getProductbyFilter(city.city.id, city.city.latitude, city.city.longitude)
                    .then(response => response.json())
                    .then(result => {
                        if (result.status === 1) {
                            setproductSizes(result.sizes);
                            dispatch(setProductSizes({ data: result.sizes }));
                        }
                    });
            }
        }
        else {
            setproductSizes(sizes.sizes);
        }



        if ((cart.cart === null && cart.status === 'fulfill') || cart.status === 1) {
            setiscartEmpty(true);
        }
        else {
            setiscartEmpty(false);
        }

    }, [cart]);



    useEffect(() => {
        if (isCartSidebarOpen == true)
            fetchCartData();
    }, [isCartSidebarOpen]);

    const fetchCartData = async () => {
        setisLoader(true);
        try {
            const response = await api.getCart(cookies.get("jwt_token"), city?.city?.latitude, city?.city?.longitude);
            const result = await response.json();
            if (result.status == 1) {
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
                // setCartSubTotal(result?.data?.sub_total);
                setCartSidebarData(result?.data?.cart);
            }
        } catch (err) {
            console.log(err?.message);
        }
        setisLoader(false);
    };

    //Add to Cart
    const addtoCart = async (product_id, product_variant_id, qty) => {
        await api.addToCart(cookies.get('jwt_token'), product_id, product_variant_id, qty)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    toast.success(result.message);
                    dispatch(setCartSubTotal({ data: result?.sub_total ? result?.sub_total : 0 }));
                    const updatedCartProducts = cartSidebarData?.map(product => {
                        if ((product.product_id == product_id) && (product?.product_variant_id == product_variant_id)) {
                            return { ...product, qty: qty };
                        } else {
                            return product;
                        }
                    });
                    setCartSidebarData(updatedCartProducts);
                    const updatedProducts = cart?.cartProducts?.map((product) => {
                        if ((product?.product_id == product_id) && (product?.product_variant_id == product_variant_id)) {
                            return { ...product, qty: qty };
                        } else {
                            return product;
                        }
                    });
                    dispatch(setCartProducts({ data: updatedProducts }));

                } else if (result.status === 0) {
                    setisLoader(false);
                }
                else {
                    setisLoader(false);
                    toast.error(result.message);
                }
            });
    };

    //remove from Cart
    const removefromCart = async (product_id, product_variant_id) => {
        // setisLoader(true);
        await api.removeFromCart(cookies.get('jwt_token'), product_id, product_variant_id)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    toast.success(result.message);
                    const updatedCartProducts = cart?.cartProducts?.filter(product => {
                        if (product?.product_variant_id != product_variant_id) {
                            return product;
                        }
                    });
                    dispatch(setCartProducts({ data: updatedCartProducts ? updatedCartProducts : [] }));
                    dispatch(setCartSubTotal({ data: result?.sub_total }));
                    const updatedProducts = cartSidebarData?.filter(product => {
                        if (product.product_variant_id != product_variant_id) {
                            return product;
                        }
                    });
                    setCartSidebarData(updatedProducts);
                }
                else {
                    toast.error(result.message);
                }
            })
            .catch(error => console.log(error));
        // setisLoader(false);
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
            closeCanvas.current.click();
            navigate('/checkout');
        });
    };

    const removeCoupon = () => {
        dispatch(clearCartPromo());
        toast.info("Coupon Removed");
    };

    function getProductQuantities(products) {
        return Object.entries(products.reduce((quantities, product) => {
            const existingQty = quantities[product.product_id] || 0;
            return { ...quantities, [product.product_id]: existingQty + product.qty };
        }, {})).map(([productId, qty]) => ({
            product_id: parseInt(productId),
            qty
        }));
    }

    return (
        <div tabIndex="-1" className={`cart-sidebar-container offcanvas offcanvas-end`} id="cartoffcanvasExample" aria-labelledby="cartoffcanvasExampleLabel">
            <div className='cart-sidebar-header'>
                <h5>{t("your_cart")}</h5>
                <button type="button" className="close-canvas" data-bs-dismiss="offcanvas" aria-label="Close" ref={closeCanvas} onClick={() => setIsCartSidebarOpen(false)}>
                    <AiOutlineCloseCircle fill='black' />
                </button>
            </div>

            {(cartSidebarData?.length == 0 && !isLoader) ? (
                <div className='empty-cart'>
                    <img src={EmptyCart} alt='empty-cart' onError={placeHolderImage}></img>
                    <p>{t("empty_cart_list_message")}</p>
                    <span>{t("empty_cart_list_description")}</span>
                    <button type='button' className="close-canvas" data-bs-dismiss="offcanvas" aria-label="Close" onClick={() => {
                        navigate('/products');
                    }}>{t("empty_cart_list_button_name")}</button>
                </div>) : (
                <>
                    {isLoader == true
                        ? (
                            <Loader width='100%' height='100%' />
                        )
                        : (
                            <>
                                <div className='cart-sidebar-product'>
                                    <div className='products-header'>
                                        <span>{t("product")}</span>
                                        <span>{t("price")}</span>
                                    </div>

                                    <div className='products-container'>


                                        {cartSidebarData?.map((product, index) => (
                                            <div key={index} className='cart-card'>
                                                <div className='left-wrapper'>
                                                    <Link to={`/product/${product.slug}`}>
                                                        <div className='image-container'>
                                                            <img src={product.image_url} alt='product' onError={placeHolderImage}></img>
                                                        </div>
                                                    </Link>

                                                    <div className='product-details'>

                                                        <span>{product.name}</span>

                                                        <div id={`selectedVariant${index}-wrapper-cartsidebar`} className='selected-variant-cart' >
                                                            {product.measurement} {product.unit}
                                                        </div>
                                                        <div className='counter'>
                                                            <button type='button' onClick={() => {
                                                                if (product.qty > 1) {
                                                                    addtoCart(product.product_id, product.product_variant_id, product.qty - 1);
                                                                }

                                                            }}>
                                                                <BiMinus fill='#fff' />
                                                            </button>
                                                            <span id={`input-cart-sidebar${index}`} >
                                                                {product.qty}
                                                            </span>
                                                            <button type='button'
                                                                onClick={() => {
                                                                    const productQuantity = getProductQuantities(cart?.cartProducts);
                                                                    if (Number(product.is_unlimited_stock) === 1) {
                                                                        if (productQuantity?.find(prdct => prdct?.product_id == product?.product_id)?.qty <= Number(product?.total_allowed_quantity)) {
                                                                            addtoCart(product.product_id, product.product_variant_id, product.qty + 1);
                                                                        } else {
                                                                            toast.error('Apologies, maximum product quantity limit reached!');
                                                                        }
                                                                    } else {
                                                                        if (Number(product.qty) >= Number(product.stock)) {
                                                                            toast.error(t("out_of_stock_message"));

                                                                        } else if (productQuantity?.find(prdct => prdct?.product_id == product?.product_id)?.qty <= Number(product?.total_allowed_quantity)) {
                                                                            toast.error('Apologies, maximum product quantity limit reached!');
                                                                        }
                                                                        else {
                                                                            addtoCart(product.product_id, product.product_variant_id, product.qty + 1);
                                                                        }
                                                                    }
                                                                }}>
                                                                <BsPlus fill='#fff' />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className='cart-card-end'>
                                                    <div className='d-flex flex-column align-items-center' style={{ fontSize: "14px", color: "var(--secondary-color)" }}>
                                                        <span id={`price${index}-cart-sidebar`}>
                                                            {setting.setting && setting.setting.currency}
                                                            {(product.discounted_price == 0 ? (product.price * product.qty).toFixed(setting.setting && setting.setting.decimal_point) : (product.discounted_price * product.qty).toFixed(setting.setting && setting.setting.decimal_point))}</span>
                                                        {product?.price ?
                                                            <span id={`price${index}-section`} className="d-flex align-items-center" >
                                                                <p id='relatedproduct-fa-rupee' className='fw-normal text-decoration-line-through m-0' style={{ color: "var(--sub-text-color)", fontSize: "14px" }}>{setting.setting && setting.setting.currency}
                                                                    {product?.price?.toFixed(setting.setting && setting.setting.decimal_point)}
                                                                </p>
                                                            </span>
                                                            : null}
                                                    </div>

                                                    <button type='button' className='remove-product' onClick={() => {
                                                        removefromCart(product.product_id, product.product_variant_id);
                                                        dispatch(clearCartPromo());
                                                    }}>{t("delete")}</button>

                                                </div>
                                            </div>
                                        ))}


                                    </div>
                                </div>

                                <div className='cart-sidebar-footer'>

                                    {/* Apply Promo Code */}
                                    <div className="promo-wrapper">
                                        <div className="promo-container">
                                            <div className=" d-flex justify-content-between align-items-center d-lg-flex pb-4 mb-4" style={{ borderBottom: '1px solid lightgrey' }}>
                                                <span className=""
                                                    style={{ fontSize: "16px" }}>{t("have_coupon")}</span>
                                                <button className="btn promo-button" onClick={() => setShowPromoOffcanvas(true)}
                                                // style={{ backgroundColor: '#33a36b', color: 'white', fontSize: '14px' }}
                                                >{t("view_coupon")}</button>
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
                                    <Promo show={showPromoOffcanvas} setShow={setShowPromoOffcanvas} />
                                    {cart.cart?.data === null
                                        ? (
                                            <Loader />
                                        )
                                        : (
                                            <>
                                                <div className='summary'>
                                                    <div className='d-flex justify-content-between'>
                                                        <span>{t("sub_total")}</span>
                                                        <div className='d-flex align-items-center' style={{ fontSize: "14px" }}>
                                                            {setting.setting && setting.setting.currency}
                                                            <span>{(cart?.promo_code?.discount ? (cart?.cartSubTotal - cart?.promo_code?.discount)?.toFixed(setting.setting?.decimal_point) : cart?.cartSubTotal?.toFixed(setting.setting?.decimal_point))}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='button-container'>
                                                    <button type='button' className='view-cart' onClick={() => {
                                                        closeCanvas.current.click();
                                                        navigate('/cart');
                                                    }}>{t("view_cart")}</button>
                                                    <button type='button' className='checkout' onClick={() => {
                                                        stockValidation();

                                                    }}>{t("proceed_to_checkout")}</button>
                                                </div>
                                            </>)}
                                </div>
                            </>
                        )}
                </>
            )
            }
        </div>

    );
};

export default Cart;