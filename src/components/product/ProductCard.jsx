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
import { addGuestCartTotal, addtoGuestCart, setCart, setCartProducts, setCartSubTotal, setSellerFlag } from '../../model/reducer/cartReducer';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch()
    // reducer imports
    const setting = useSelector(state => (state.setting));
    const cart = useSelector(state => (state.cart))

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
                
            }
        } catch (error) {
            console.log("error", error)
        }
    }


    const validateAddExistedProduct = () => { }

    const calculateDiscount = (discountPrice, actualPrice) => {
        const difference = actualPrice - discountPrice;
        const actualDiscountPrice = (difference / actualPrice)
        return actualDiscountPrice * 100;
    }

    return (
        <div >
            <div className="product-grid " >
                <div >
                    <div className="product-image" >
                        <a onClick={() => navigate(`/product/${product.slug}`)} className="image">
                            <img src={product?.image_url} />
                        </a>
                        {selectedVariant?.discounted_price !== 0 ? <span className="product-discount-label">{calculateDiscount(selectedVariant?.discounted_price, selectedVariant?.price).toFixed(0)}% OFF</span> : <></>}

                        <ul className="product-links">
                            <li><a href="#" data-tip="Add to Wishlist"><i className="fas fa-heart"></i></a></li>
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
                                    <p>{`(${product?.average_rating})`}</p>
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
                    {selectedVariant?.cart_count > 0 ?
                        <div className='cart-count-btn'><button><FaMinus /></button>
                            <input value={cart?.cartProducts?.find(prdct => prdct?.product_variant_id == selectedVariant.id)?.qty} disabled min='1' type='number' max={selectedVariant?.stock} />


                            <button onClick={() => addToCart(product?.id, selectedVariant?.id, selectedVariant?.cart_count + 1)}><FaPlus /></button>
                        </div>
                        : <button className='product-cart-btn' onClick={() => { addToCart(product?.id, selectedVariant?.id, 1) }}><FaShoppingBasket className='mx-2' size={20} />Add</button>}

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