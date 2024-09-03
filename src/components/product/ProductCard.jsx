import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import "./productcard.css";
import { Rate } from 'antd';
import QuickViewModal from './QuickViewModal';
import * as newApi from "../../api/apiCollection"
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// icons imports
import { FaMinus, FaPlus, FaShoppingBasket } from 'react-icons/fa';
import { StarFilled, StarOutlined } from '@ant-design/icons';
import { IoMdArrowDropdown } from "react-icons/io";
// Reducer imports
import { addGuestCartTotal, addtoGuestCart, setCart, setCartProducts, setCartSubTotal, subGuestCartTotal } from '../../model/reducer/cartReducer';
import { useTranslation } from 'react-i18next';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const { t } = useTranslation();
    // reducer imports
    const setting = useSelector(state => (state.setting));
    const cart = useSelector(state => (state.cart))
    const user = useSelector(state => (state.user))

    // state variables
    const [p_id, setP_id] = useState(0);
    const [p_v_id, setP_V_id] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setselectedProduct] = useState({});
    const [selectedVariant, setSelectedVariant] = useState(product?.variants[0])

    const addToCart = async (productId, productVId, qty) => {
        try {
            const response = await newApi.addToCart({ product_id: productId, product_variant_id: productVId, qty: qty })
            if (response.status === 1) {
                if (cart?.cartProducts?.find((product) => ((product?.product_id == productId) && (product?.product_variant_id == productVId)))?.qty == undefined) {
                    dispatch(setCart({ data: response }));
                    const updatedCartCount = [...cart?.cartProducts, { product_id: productId, product_variant_id: productVId, qty: qty }];
                    dispatch(setCartProducts({ data: updatedCartCount }));
                    dispatch(setCartSubTotal({ data: response?.sub_total }));
                }
                else {
                    const updatedProducts = cart?.cartProducts?.map(product => {
                        if (((product.product_id == productId) && (product?.product_variant_id == productVId))) {
                            return { ...product, qty: qty };
                        } else {
                            return product;
                        }
                    });
                    dispatch(setCart({ data: response }));
                    dispatch(setCartProducts({ data: updatedProducts }));
                    dispatch(setCartSubTotal({ data: response?.sub_total }));
                }
            }
        } catch (error) {
            console.log("error", error)
        }
    }

    const removeFromCart = async (productId, variantId) => {
        try {
            const response = await newApi.removeFromCart({ product_id: productId, product_variant_id: variantId })
            if (response?.status === 1) {
                const updatedProducts = cart?.cartProducts?.filter(product => ((product?.product_id != productId) && (product?.product_variant_id != variantId)));

                dispatch(setCartProducts({ data: updatedProducts }));
            } else {
                toast.error(response.message)
            }
        } catch (error) {
            console.log("error", error)
        }
    }

    const getProductQuantities = (products) => {
        return Object.entries(products?.reduce((quantities, product) => {
            const existingQty = quantities[product.product_id] || 0;
            return { ...quantities, [product.product_id]: existingQty + product.qty };
        }, {})).map(([productId, qty]) => ({
            product_id: parseInt(productId),
            qty
        }));
    }

    const calculateDiscount = (discountPrice, actualPrice) => {
        const difference = actualPrice - discountPrice;
        const actualDiscountPrice = (difference / actualPrice)
        return actualDiscountPrice * 100;
    }



    const handleValidateAddNewProduct = (productQuantity, product) => {
        const productQty = productQuantity?.find(prdct => prdct?.product_id == product?.id)?.qty

        if ((productQuantity?.find(prdct => prdct?.product_id == product?.id)?.qty || 0) >= Number(product?.total_allowed_quantity)) {
            toast.error('Oops, Limited Stock Available');
        }
        else if (Number(product.is_unlimited_stock)) {
            addToCart(product.id, product?.variants?.[0].id, 1);
        } else {
            if (selectedVariant?.status) {
                addToCart(product.id, selectedVariant?.id, 1);
            } else {
                toast.error('Oops, Limited Stock Available');
            }
        }

    };

    const handleValidateAddExistingProduct = (productQuantity, product) => {
        const productQty = productQuantity?.find(prdct => prdct?.product_id == product?.id)?.qty
        if (Number(product.is_unlimited_stock)) {
            if (productQty < Number(product?.total_allowed_quantity)) {
                addToCart(product.id, selectedVariant?.id, cart?.cartProducts?.find(prdct => prdct?.product_variant_id == selectedVariant?.id)?.qty + 1);
            } else {
                toast.error('Apologies, maximum product quantity limit reached!');
            }
        } else {
            if (productQty >= Number(product.variants[0].stock)) {
                toast.error(t("out_of_stock_message"));
            }
            else if (Number(productQty) >= Number(product.total_allowed_quantity)) {
                toast.error('Apologies, maximum product quantity limit reached');
            } else {
                addToCart(product.id, selectedVariant?.id, cart?.cartProducts?.find(prdct => prdct?.product_variant_id == selectedVariant?.id)?.qty + 1);
            }
        }
    };

    const handleAddNewProductGuest = (productQuantity, product) => {
        const productQty = productQuantity?.find(prdct => prdct?.product_id == product?.id)?.qty
        if (Number(productQty || 0) < Number(product.total_allowed_quantity)) {
            AddToGuestCart(product, product.id, selectedVariant?.id, 1, 0);
        } else {
            toast.error(t("out_of_stock_message"));
        }
    };
    const AddToGuestCart = (product, productId, productVariantId, Qty, isExisting) => {
        const finalPrice = selectedVariant?.discounted_price !== 0 ? selectedVariant?.discounted_price : selectedVariant?.price
        if (isExisting) {
            let updatedProducts;
            if (Qty !== 0) {
                updatedProducts = cart?.guestCart?.map((product) => {

                    if (product?.product_id == productId && product?.product_variant_id == productVariantId) {
                        return { ...product, qty: Qty };
                    } else {
                        return product;
                    }

                });
            } else {
                updatedProducts = cart?.guestCart?.filter(product =>
                    product?.product_id != productId && product?.product_variant_id != productVariantId
                );
                dispatch(subGuestCartTotal({ data: finalPrice }));
            }

            dispatch(addtoGuestCart({ data: updatedProducts }));

        } else {
            dispatch(addGuestCartTotal({ data: finalPrice }))
            const productData = { product_id: productId, product_variant_id: productVariantId, qty: Qty };
            dispatch(addtoGuestCart({ data: [...cart?.guestCart, productData] }));
        }
    };

    const computeSubTotal = (products) => {
        const subTotal = products.reduce((prev, curr) => {
            prev += (curr.discounted_price !== 0 ? curr.discounted_price * curr.qty : curr.price * curr.qty);
            return prev;
        }, 0);
        dispatch(addGuestCartTotal(subTotal));
    };



    const handleValidateAddExistingGuestProduct = (productQuantity, product, quantity) => {
        const productQty = productQuantity?.find(prdct => prdct?.product_id == product?.id)?.qty;

        if (Number(product.is_unlimited_stock)) {
            if (productQty >= Number(product?.total_allowed_quantity)) {
                toast.error('Apologies, maximum product quantity limit reached');
            }
            else {
                AddToGuestCart(product, product?.id, selectedVariant?.id, quantity, 1);
            }
        }
        else {
            if (productQty >= Number(selectedVariant?.stock)) {
                toast.error('Oops, Limited Stock Available');
            }
            else if (productQty >= Number(product?.total_allowed_quantity)) {
                toast.error('Apologies, maximum cart quantity limit reached');
            }
            else {
                AddToGuestCart(product, product?.id, selectedVariant?.id, quantity, 1);
            }
        }
    };

    return (
        <div >
            <div className="product-grid" >
                <div >
                    <div className="product-image" >
                        <a onClick={() => navigate(`/product/${product.slug}`)} className="image">
                            <img src={product?.image_url} />
                        </a>
                        {selectedVariant?.discounted_price !== 0 ? <span className="product-discount-label">{calculateDiscount(selectedVariant?.discounted_price, selectedVariant?.price).toFixed(0)}% OFF</span> : <></>}

                        <ul className="product-links">
                            <li><a data-tip="Add to Wishlist"><i className="fas fa-heart"></i></a></li>
                            <li onClick={() => {
                                setselectedProduct(product)
                                setShowModal(true)
                            }}><a data-tip="Quick View" ><i className="fa fa-eye"></i></a></li>
                        </ul>
                    </div>
                    <div className="product-content" onClick={() => navigate(`/product/${product.slug}`)}>
                        <div >
                            <h3 className="title"><a href="#"> {product?.name} </a></h3>
                            {product?.average_rating > 0 ?
                                <div className="rating">
                                    <Rate
                                        disabled
                                        defaultValue={2.6}
                                        allowHalf={true}
                                        style={{ fontSize: 15 }}
                                        characterRender={(node, { index }) => (
                                            <span className={index + 1 <= product?.average_rating ? "filledStar" : "emptyStar"}>
                                                {index + 1 <= product?.average_rating ? <StarFilled /> : <StarOutlined />}
                                            </span>
                                        )}
                                    />
                                    <p>{`(${product?.average_rating.toFixed(2)})`}</p>
                                </div>
                                : null}

                        </div>

                        <div className="price">{setting.setting.currency}{selectedVariant?.
                            discounted_price !== 0 ? selectedVariant?.
                            discounted_price : selectedVariant?.
                            price}<span>{selectedVariant?.
                                discounted_price !== 0 && <>
                                    {setting.setting.currency}
                                    {selectedVariant?.
                                        price}
                                </>}</span>
                        </div>
                    </div>
                </div>

                <div className='product-btn'>
                    <button className='product-qty-btn'>
                        {`${selectedVariant?.measurement} ${selectedVariant?.stock_unit_name}`} {product?.variants?.length > 1 ? <IoMdArrowDropdown /> : null}
                    </button>

                    {cart?.isGuest === false && cart?.cartProducts?.find((prdct) => prdct?.product_variant_id == selectedVariant?.id)?.qty > 0 ||
                        cart?.isGuest === true && cart?.guestCart?.find((prdct) => prdct?.product_variant_id === selectedVariant?.id)?.qty > 0
                        ?
                        <div className='cart-count-btn'><button
                            onClick={() => {
                                if (cart?.isGuest) {
                                    AddToGuestCart(
                                        product,
                                        product?.id,
                                        selectedVariant?.id,
                                        cart?.guestCart?.find((prdct) => prdct?.product_variant_id == product?.variants?.[0]?.id)?.qty - 1,
                                        1,

                                    );
                                } else {
                                    if (cart?.cartProducts?.find((prdct) => prdct?.product_variant_id == selectedVariant?.id).qty == 1) {
                                        removeFromCart(product?.id, selectedVariant?.id)
                                    } else {
                                        addToCart(product.id, selectedVariant.id, cart?.cartProducts?.find(prdct => prdct?.product_variant_id == selectedVariant?.id)?.qty - 1);
                                    }
                                }
                            }}
                        ><FaMinus /></button>

                            <input value={
                                cart.isGuest === false ?
                                    cart?.cartProducts?.find(prdct => prdct?.product_variant_id == selectedVariant.id)?.qty
                                    : cart?.guestCart?.find(prdct => prdct?.product_variant_id == selectedVariant.id)?.qty
                            } disabled min='1' type='number' max={selectedVariant?.stock} />

                            <button onClick={() => {
                                if (cart?.isGuest) {
                                    const productQuantity = getProductQuantities(cart?.guestCart)
                                    handleValidateAddExistingGuestProduct(
                                        productQuantity,
                                        product,
                                        cart?.guestCart?.find(prdct => prdct?.product_id == product?.id && prdct?.product_variant_id == selectedVariant?.id)?.qty + 1
                                    )
                                } else {
                                    const quantity = getProductQuantities(cart?.cartProducts)
                                    handleValidateAddExistingProduct(quantity, product)
                                }
                            }}><FaPlus /></button>
                        </div>
                        : <button className='product-cart-btn' onClick={() => {
                            if (cart?.isGuest) {
                                const quantity = getProductQuantities(cart?.cartProducts)
                                handleAddNewProductGuest(quantity, product)
                            } else {
                                const quantity = getProductQuantities(cart?.cartProducts)
                                handleValidateAddNewProduct(quantity, product)
                            }

                        }} ><FaShoppingBasket className='mx-2' size={20} />Add</button>}

                </div>
            </div >

            <QuickViewModal selectedProduct={selectedProduct} setselectedProduct={setselectedProduct} showModal={showModal} setShowModal={setShowModal}
                setP_id={setP_id}
                setP_V_id={setP_V_id}
            />
        </div >
    )
}

export default ProductCard